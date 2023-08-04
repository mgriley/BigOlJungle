"use strict";

// background.js
// See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// https://github.com/mdn/webextensions-examples

console.log("Background Script Loaded!");

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message: ", message);
  if (message.type == 'echo') {
    sendResponse({result: message.data});
  } else if (message.type == 'fetch') {
    const { url, options } = message.data;
    fetch(url, options).then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch \"${url}\". ${response.status} ${response.statusText}`);
      }
      return response.text();
    }).then((text) => {
      sendResponse({result: text});
    }).catch((error) => {
      console.error("Background fetch error: ", error);
      sendResponse({error: error.toString(), message: message});
    });
  }

  // Return true here since the sendResponse func is called async
  return true;
});

