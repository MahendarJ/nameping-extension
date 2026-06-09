# NamePing

NamePing is a Chrome extension that alerts you when your name is mentioned in Google Meet captions. It helps you stay aware of when someone is talking to you or about you, even if you are multi-tasking or have the meeting audio muted.

## Features

- **Real-time Name Detection:** Monitors Google Meet live captions to detect when your name is spoken.
- **Audio Alerts:** Plays a triple-beep sound (`alert.mp3`) when your name is detected.
- **Visual Alerts:** Displays a brief, non-intrusive flashing visual animation on the screen.
- **Smart Filtering:** Ignores speaker names in the captions, ensuring it only alerts you when your name is actually *spoken* by someone else.
- **Dynamic Connection:** Automatically connects to the captions container whenever you turn closed captions on or off during a meeting.

## Installation

Since this is an unpacked extension, you can install it locally in Google Chrome:

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the `nameping-extension` directory.
6. The extension will now appear in your list of installed extensions.

## Usage

1. Click on the NamePing extension icon in your Chrome toolbar to open the settings popup.
2. Enter your name in the input field and click "Save".
3. Join a Google Meet call (`https://meet.google.com/*`).
4. **Important:** You must turn on **Captions (CC)** in the Google Meet for the extension to work.
5. Whenever someone says your name and it appears in the captions, you will hear the alert sound and see the screen flash!

## Technical Details

- **Manifest V3:** Built using the modern Chrome Extension Manifest V3 standard.
- **Content Script (`content/content.js`):** Uses a `MutationObserver` to watch the Google Meet DOM for updates to the captions container (`[aria-label="Captions"]`).
- **Storage API:** Uses `chrome.storage.sync` to save and load the user's name across their Chrome profile.
- **Audio Playback:** Uses the Web Audio API (`new Audio()`) to play an MP3 asset included within the extension bundle.

## Permissions Required

The extension requests the following permissions in its `manifest.json`:
- `storage`: To save the user's configured name.
- `activeTab`: To allow the popup to interact with the current tab if needed.
- `scripting`: To inject the content script into the Google Meet page.
- `host_permissions` (`https://meet.google.com/*`): To restrict the extension to only operate on Google Meet URLs.
