const input = document.getElementById("nameInput");
const button = document.getElementById("saveBtn");

// Load saved name
chrome.storage.sync.get(["name"], (result) => {
  if (result.name) {
    input.value = result.name;
  }
});

button.addEventListener("click", () => {
  const name = input.value.trim();

  if (name) {
    chrome.storage.sync.set({ name }, () => {
      alert("Saved!");
    });
  }
});