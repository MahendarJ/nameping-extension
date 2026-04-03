console.log("🚀 NamePing loaded");

let userName = "";

// Initial load of the name
chrome.storage.sync.get(["name"], (res) => {
  if (res.name) {
    userName = res.name.toLowerCase().trim();
    console.log("Name loaded:", userName);
  }
});

// Update name if changed in the popup
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.name) {
    userName = changes.name.newValue.toLowerCase().trim();
    console.log("Name updated:", userName);
  }
});

let lastNameCount = 0;
let isAlerting = false; // Prevent multiple overlapping alerts

function countNameOccurrences(text, name) {
  if (!name) return 0;
  // Use regex with word boundaries and global flag 'g' to count all occurrences
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function getSpokenText(container) {
  // Google Meet captions have speaker blocks with an avatar <img> and the speaker's name.
  // The actual spoken text is in a sibling element.
  // By stripping out the container that holds the <img>, we completely discard the speaker names!
  const clone = container.cloneNode(true);
  
  const imgs = clone.querySelectorAll('img');
  imgs.forEach(img => {
    const speakerInfoDiv = img.parentElement;
    if (speakerInfoDiv && speakerInfoDiv.parentNode) {
      speakerInfoDiv.parentNode.removeChild(speakerInfoDiv);
    }
  });

  return clone.innerText || "";
}

function triggerAlert() {
  if (isAlerting) return;
  isAlerting = true;
  
  console.log("🔥 NAME DETECTED! Alerting user.");
  
  // 1. Trigger Flash CSS animation
  const flashDiv = document.createElement("div");
  flashDiv.className = "nameping-flash";
  document.body.appendChild(flashDiv);

  // 2. Play Sound (3 beeps)
  let beepsPlayed = 0;
  const playBeep = () => {
    if (beepsPlayed >= 3) return; 
    const audio = new Audio(chrome.runtime.getURL("assets/alert.mp3"));
    audio.play().catch(e => console.log("Audio play error (user interaction might be needed inside tab):", e));
    beepsPlayed++;
    if (beepsPlayed < 3) {
      setTimeout(playBeep, 600);
    }
  };
  playBeep();

  // Reset alert state after the animation finishes and clean up
  setTimeout(() => {
    if (flashDiv.parentNode) {
      flashDiv.parentNode.removeChild(flashDiv);
    }
    isAlerting = false;
  }, 1800); 
}

function init() {
  if (window.namePingInitialized) return;
  window.namePingInitialized = true;

  let currentObserver = null;
  let currentContainer = null;

  // Poll for captions container to handle CC toggle on/off by the user dynamically
  setInterval(() => {
    const container = document.querySelector('[aria-label="Captions"]');
    
    if (container && container !== currentContainer) {
      if (currentObserver) {
        currentObserver.disconnect();
      }
      currentContainer = container;
      
      console.log("✅ Captions container detected. Connecting observer.");
      currentObserver = new MutationObserver(() => {
        // Only extract the actual spoken words (ignoring speaker names)
        const text = getSpokenText(container).trim();
        
        if (!text) {
          lastNameCount = 0;
          return;
        }

        if (userName) {
          const currentCount = countNameOccurrences(text, userName);

          // If the name appears more times than before, trigger the alert!
          if (currentCount > lastNameCount) {
            triggerAlert();
          }

          // Sync the alert count down to match current occurrences (handles scrolling drops and rewrites)
          lastNameCount = currentCount;
        }
      });
      
      currentObserver.observe(container, {
        childList: true,
        subtree: true,
        characterData: true
      });
    } else if (!container && currentContainer) {
      console.log("❌ Captions container removed.");
      if (currentObserver) {
        currentObserver.disconnect();
        currentObserver = null;
      }
      currentContainer = null;
      lastNameCount = 0;
    }
  }, 1000);
}

init();