import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson, cleanUrl, } from './Utils.js'
import { QuickParser } from './QuickParse.js'
import { ScriptParser } from './ScriptParse.js'
import { RemoteParser } from './RemoteParse.js'

export class PluginUtils {
  static getAutoNameFromUrl(rawUrl) {
    let autoName = rawUrl;
    try {
      let hostname = (new URL(cleanUrl(rawUrl))).hostname;
      let parts = hostname.split(".");
      // Remove TLD
      parts.pop();
      // Remove www, if there
      if (parts[0] === 'www') {
        parts.shift();
      }
      autoName = parts.join('.');
    } catch (err) {
      console.log(`Could not get auto name from url: ${rawUrl}. Err:\n${err}`);
    }
    return autoName;
  }

  static getAutoNameFromUrlPath(rawUrl) {
    let autoName = rawUrl;
    try {
      autoName = (new URL(cleanUrl(rawUrl))).pathname;
      if (autoName[0] == '/') {
        autoName = autoName.substring(1);
      }
    } catch (err) {
      console.log(`Could not get auto name from url: ${rawUrl}. Err:\n${err}`);
    }
    return autoName;
  }
}

// Base-class of built-in FeedPlugins
export class FeedPlugin {
  constructor(name) {
    this.name = name;
    this.urlPlaceholderHelp = "";
    this.quickHelpDocs = "";

    this.addFeedHelp = {
      urlHelp: "",
      urlExample: "",
      urlCompleter: null,
    };
  }

  getFeedType() {
    return this.name;
  }

  async updateFeeds(feeds) {
    // Impl in subclass
  }

  getFavicon(feed) {
    // Override in subclass for more specific favicons
    if (!feed.url) {
      return '';
    }
    try {
      let feedUrl = new URL(cleanUrl(feed.url));
      /*
      // Google way. the DuckDuck one is better
      let faviconUrl = new URL('https://www.google.com/s3/favicons')
      faviconUrl.searchParams.append('domain', feedUrl.hostname);
      faviconUrl.searchParams.append('sz', 24);
      return faviconUrl.href;
      */
      /*
      // Note: not all websites follow this format
      let faviconUrl = new URL(feedUrl.hostname + '/favicon.ico');
      return faviconUrl.href;
      */
      let faviconUrl = new URL(`https://icons.duckduckgo.com/ip3/${feedUrl.hostname}.ico`);
      return faviconUrl.href;
    } catch (err) {
      console.log(`Error parsing url: ${feed.url}:\n${err.message}`);
      return null;
    }
    return null
  }

  // Get the default feed name, from the user-given URL
  // Note: should override in the subclasses
  getAutoNameFromUrl(rawUrl) {
    return PluginUtils.getAutoNameFromUrl(rawUrl);
  }

  isBookmarkType() {
    // Override in subclasses
    return false;
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
    this.remoteParser = new RemoteParser(this);
    this.quickParser = new QuickParser(this);
    this.scriptParser = new ScriptParser(this);
    this.options = []
    this.domainWhitelist = []
    this.urlPlaceholderHelp = "Check the plugin docs for examples.";
    this.quickHelpDocs = "";
    this.addFeedHelp = {
      urlHelp: "",
      urlExample: "",
      urlCompleter: null,
    };

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

  getAutoNameFromUrl(rawUrl) {
    return PluginUtils.getAutoNameFromUrl(rawUrl);
  }

  isUrlAllowed(feed, urlString) {
    let allowedUrls = [];
    for (const item of this.domainWhitelist) {
      allowedUrls.push(item.value);
    }
    return isDomainInWhitelist(urlString, [feed.url, ...allowedUrls]);
  }
}

