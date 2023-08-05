"use strict";

/*
See:
- Mozilla Content Script docs.
- https://github.com/mdn/webextensions-examples/blob/main/page-to-extension-messaging/content-script.js

Listen to messages from JungleReader and pass the message to the background process for
processing.
*/

console.log("Content Script Loaded!");

window.addEventListener("message", async (event) => {
  let allowedOrigins = new Set([
    "https://www.junglereader.com",
    "https://junglereader.pages.dev"
  ]);
  let msgData = event.data;
  if (!(event.source == window &&
    allowedOrigins.has(event.origin) &&
    msgData)) {
    return;
  }
  if (msgData.type == "ExtRequest") {
    if (!msgData.payload) {
      console.error("No payload. Invalid request.");
      return;
    }
    const response = await browser.runtime.sendMessage(msgData.payload);
    // console.log("Response: ", response);
    window.postMessage({type: "ExtResponse", reqId: msgData.reqId, payload: response}, event.origin);
  }
});

