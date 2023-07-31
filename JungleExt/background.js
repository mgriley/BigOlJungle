"use strict";

// background.js
// See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// https://github.com/mdn/webextensions-examples

console.log("Background Script Loaded!");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message: ", message);
  sendResponse({echo: message});
  
  // Return true here since the sendResponse func is called async
  return true;
});

