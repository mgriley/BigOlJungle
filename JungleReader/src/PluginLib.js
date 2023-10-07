import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson } from './Utils.js'
import { QuickParser } from './QuickParse.js'
import { ScriptParser } from './ScriptParse.js'
import { RemoteParser } from './RemoteParse.js'

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
  // Note: was renamed to Script later
  Text: 'Script',
  QuickParse: 'QuickParse',
};

export class CustomPlugin {
  constructor(app) {
    this.app = app;
    this.isEnabled = true;
    this.feedType = "";
    this.pluginType = CustomPluginType.URL;
    this.remoteParser = new RemoteParser();
    this.quickParser = new QuickParser();
    this.scriptParser = new ScriptParser();
    this.options = []
    this.domainWhitelist = []
    this.urlPlaceholderHelp = "Check the plugin docs for examples.";
    this.quickHelpDocs = "";

    this.expandedInUi = true;
  }

  writeToJson() {
    return {
      isEnabled: this.isEnabled,
      feedType: this.feedType,
      pluginType: this.pluginType,
      remoteParser: this.remoteParser.writeToJson(),
      scriptParser: this.scriptParser.writeToJson(),
      quickParser: this.quickParser.writeToJson(),
      options: optionsToJson(this.options),
      domainWhitelist: writeObjToJson(this.domainWhitelist),
    }
  }

  readFromJson(obj) {
    if ('isEnabled' in obj) {
      this.isEnabled = obj.isEnabled;
    }
    this.feedType = obj.feedType;
    this.pluginType = obj.pluginType;
    if ('remoteParser' in obj) {
      this.remoteParser.readFromJson(obj.remoteParser);
    }
    if ('scriptParser' in obj) {
      this.scriptParser.readFromJson(obj.scriptParser);
    }
    if ('quickParser' in obj) {
      this.quickParser.readFromJson(obj.quickParser);
    }
    this.options = jsonToOptions(obj.options);
    if ('domainWhitelist' in obj) {
      this.domainWhitelist = readObjFromJson(obj.domainWhitelist);
    }
  }

  getFeedType() {
    return this.feedType;
  }

  async updateFeeds(feeds) {
    if (!this.isEnabled) {
      return;
    }
    for (const feed of feeds) {
      try {
        if (this.pluginType == CustomPluginType.Text) {
          await this.scriptParser.updateFeed(feed);
        } else if (this.pluginType == CustomPluginType.URL) {
          await this.remoteParser.updateFeed(feed);
        } else if (this.pluginType == CustomPluginType.QuickParse) {
          await this.quickParser.updateFeed(feed);
        } else {
          throw new Error(`Unexpected pluginType: \"${this.pluginType}\"`);
        }
      } catch (err) {
        console.error(`Error updating feed "${feed.name}":\n${err}`, err.stack);
        feed.setError(`Error updating feed "${feed.name}": ${err.message}`);
      }
    }
  }

  isUrlAllowed(urlString) {
    let allowedUrls = [];
    for (const item of this.domainWhitelist) {
      allowedUrls.push(item.value);
    }
    // TODO - this is wrong. Should allow the feedURL (explicitly 
    let feedUrl = TODO;
    return isDomainInWhitelist(urlString, [feedUrl, ...allowedUrls]);
  }
}

