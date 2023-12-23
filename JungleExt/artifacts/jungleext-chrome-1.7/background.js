"use strict";

// background.js
// See: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts
// https://github.com/mdn/webextensions-examples

import './browser-polyfill.js'

console.log("Background Script Loaded!");

function handleInfo(message, sendResponse) {
  let extInfo = {
    version: "1.0.0",
  }
  sendResponse({result: extInfo});
}

function handleEcho(message, sendResponse) {
  sendResponse({result: message.data});
}

async function handleFetch(message, sendResponse) {
  try {
    let msgData = message.data;
    const url = new URL(msgData.url);

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

async function handleLaunchTab(message, sendResponse) {
  let msgData = message.data;
  let tab = await browser.tabs.create({
    url: msgData.url,
    active: false,
  });
  sendResponse({result: "LOL HI"})
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message: ", message);
  if (message.type == "info") {
    handleInfo(message, sendResponse);
  } else if (message.type == 'echo') {
    handleEcho(message, sendResponse);
  } else if (message.type == 'fetch') {
    handleFetch(message, sendResponse);
  } else if (message.type == 'LaunchTab') {
    handleLaunchTab(message, sendResponse);
  }
  // Return true here since the sendResponse func is called async
  return true;
});

