"use strict";

/*
See:
- Mozilla Content Script docs.
- https://github.com/mdn/webextensions-examples/blob/main/page-to-extension-messaging/content-script.js

Listen to messages from JungleReader and pass the message to the background process for
processing.
*/

console.log("Content Script Loaded!");

function isAllowedOrigin(origin) {
  let originHostname = (new URL(origin)).hostname;
  return originHostname == "www.junglereader.com" ||
    originHostname.endsWith(".junglereader.pages.dev");
}

window.addEventListener("message", async (event) => {
  console.log("JungleExt received message.");
  if (event.source !== window) {
    console.error("Message did not come from this window");
    return;
  }
  if (!isAllowedOrigin(event.origin)) {
    console.error(`Invalid message origin, ignoring. Origin: "${event.origin}"`);
    return;
  }
  let msgData = event.data;
  if (!msgData) {
    console.error("Message has no data. Ignoring", event);
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

