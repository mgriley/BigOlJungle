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
  // TODO - verify message origin, very important 
  if (!(event.source == window && event.data)) {
    return;
  }
  if (event.data.type == "ExtRequest") {
    const response = await browser.runtime.sendMessage(event.data.payload);
    console.log("Response: ", response);
    window.postMessage({type: "ExtResponse", reqId: event.data.reqId, payload: response}, event.origin);
  }
});

