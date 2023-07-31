"use strict";

// background.js
// See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// https://github.com/mdn/webextensions-examples

console.log("Background Script Loaded!");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message: ", message);
  if (message.type == 'echo') {
    sendResponse({echo: message.data});
  } else if (message.type == 'fetch') {
    fetch("https://news.ycombinator.com", {}).then((response) => {
      if (!response.ok) {
        throw new Error(`Fetch failed`);
      }
      return response.text();
    }).then((text) => {
      sendResponse({text: text});
    }).catch((error) => {
      console.error("Fetch on error: ", error);
      sendResponse({error: error});
    });
  }

  // Return true here since the sendResponse func is called async
  return true;
});

