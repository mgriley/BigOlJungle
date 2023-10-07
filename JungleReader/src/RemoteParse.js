import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson } from './Utils.js'
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
      // TODO - load text
      throw new Error("Not Impl");
  }
}

