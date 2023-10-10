import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson, prettyJson } from './Utils.js'
import { updateFeedFromScript } from './ScriptParse.js'
import { updateFeedFromQuickParse } from './QuickParse.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { gApp } from './State.js'

export class RemoteParser {
  constructor(plugin) {
    this.plugin = plugin;
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
    throw new Error("Remote plugins are not yet implemented. Coming soon!");
    let pluginText = await gApp.fetchText(this.pluginUrl);
    let pluginJson = JSON.parse(pluginText);
    console.log("Fetched plugin: " + prettyJson(pluginText));
    if (pluginJson.type.toLowerCase() == "quickparse") {
      // QuickParse plugin needs some work
	    let configObj = pluginJson.data.config;		
      await updateFeedFromQuickParse(this.plugin, configObj, feed);
    } else if (pluginJson.type.toLowerCase() == "script") {
      let scriptText = pluginJson.data.text.join("\n");
      await updateFeedFromScript(this.plugin, scriptText, feed);
    } else {
      throw new Error("Invalid plugin type: " + pluginJson.type);
    }
  }
}

