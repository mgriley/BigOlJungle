import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString, optionsToJson, jsonToOptions } from './Utils.js'

// Base-class of built-in FeedPlugins
export class FeedPlugin {
  constructor(name) {
    this.name = name;
    this.urlPlaceholderHelp = "";
    this.quickHelpDocs = "";
  }

  getFeedType() {
    return this.name;
  }

  async updateFeeds(feeds) {
    // Impl in subclass
  }
}

export const CustomPluginType = {
  URL: 'URL',
  Text: 'Text',
};

const kDefaultCustomCode = (`

function updateFeed(feedInfo) {
  return "Hello World";  
}

`)

export class CustomPlugin {
  constructor() {
    this.feedType = "";
    this.pluginType = CustomPluginType.URL;
    this.pluginUrl = "";
    this.pluginText = kDefaultCustomCode;
    this.options = []
    this.quickHelpDocs = "";
  }

  writeToJson() {
    return {
      feedType: this.feedType,
      pluginType: this.pluginType,
      pluginUrl: this.pluginUrl,
      options: optionsToJson(this.options),
      quickHelpDocs: this.quickHelpDocs
    }
  }

  readFromJson(obj) {
    this.feedType = obj.feedType;
    this.pluginType = obj.pluginType;
    this.pluginUrl = obj.pluginUrl;
    this.options = jsonToOptions(obj.options);
    this.quickHelpDocs = obj.quickHelpDocs;
  }

  getFeedType() {
    return this.feedType;
  }

  async updateFeeds(feeds) {
    // TODO get the text then
  }
}

