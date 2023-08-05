"use strict";

// background.js
// See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// https://github.com/mdn/webextensions-examples

console.log("Background Script Loaded!");

function handleEcho(message, sendResponse) {
  sendResponse({result: message.data});
}

async function handleFetch(message, sendResponse) {
  try {
    let msgData = message.data;
    const url = new URL(msgData.url);

    // Verify that we have the proper permissions, here. Request if not.
    // TODO - cannot request permissions this way because it is not in the user input
    // handler chain. Instead, request for "<all_urls>" upfront.
    // See: https://stackoverflow.com/questions/47723297/firefox-extension-api-permissions-request-may-only-be-called-from-a-user-input
    /*
    const hostPermission = {
      origins: [`${url.origin}/`]
    }
    let hasPermission = await browser.permissions.contains(hostPermission);
    if (!hasPermission) {
      console.log(`Requesting permission for "${hostPermission.origins}"`);
      let granted = await browser.permissions.request(hostPermission);
      if (!granted) {
        throw new Error(`You have not granted JungleExt permission to contact these urls: "${hostPermission.origins}"`);
      }
    }
    */

    let response = await fetch(url, msgData.options);
    if (!response.ok) {
      throw new Error(`Failed to fetch \"${url}\". ${response.status} ${response.statusText}`);
    }
    let text = await response.text();
    sendResponse({result: text});
  } catch (error) {
    console.error("Background fetch error: ", error);
    sendResponse({error: error.toString(), message: message});
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message: ", message);
  if (message.type == 'echo') {
    handleEcho(message, sendResponse);
  } else if (message.type == 'fetch') {
    handleFetch(message, sendResponse);
  }
  // Return true here since the sendResponse func is called async
  return true;
});

