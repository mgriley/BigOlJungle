import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson } from './Utils.js'
import { updateFeedFromScript } from './ScriptParse.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { gApp } from './State.js'

export class RemoteParser {
  constructor() {
    this.pluginUrl = "";
  }

  writeToJson() {
    return {
      pluginUrl: this.pluginUrl,
    }
  }

  readFromJson(obj) {
    this.pluginUrl = obj.pluginUrl;
  }

  async updateFeed(feed) {
    let pluginText = await gApp.fetchText(this.pluginUrl);
    let pluginJson = JSON.parse(pluginText);
    console.log("Fetched plugin: " + prettyJson(prettyText));
    if (pluginJson.type == "QuickParse") {
      throw new Error("Not yet impl");
    } else if (pluginJson.type == "Script") {
      let scriptText = pluginJson.data.text.join("\n");
      await updateFeedFromScript(this, scriptText, feed);
    } else {
      throw new Error("Invalid plugin type: " + pluginJson.type);
    }
  }
}

