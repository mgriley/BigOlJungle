import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson } from './Utils.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { QuickParser } from './QuickParse.js'

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

const kDefaultCustomCode = (`

function updateFeed(feed) {
  log("Hello world!");
  log(JSON.stringify(feed));
  // TODO - updateFeed(feed, linkData);
}

`)

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
    this.pluginUrl = "";
    this.pluginText = kDefaultCustomCode;
    this.quickParser = new QuickParser();
    this.options = []
    this.domainWhitelist = []
    this.quickHelpDocs = "";

    this.pendingPromises = [];

    this.expandedInUi = true;
  }

  writeToJson() {
    return {
      isEnabled: this.isEnabled,
      feedType: this.feedType,
      pluginType: this.pluginType,
      pluginUrl: this.pluginUrl,
      pluginText: this.pluginText,
      quickParser: this.quickParser.writeToJson(),
      options: optionsToJson(this.options),
      domainWhitelist: writeObjToJson(this.domainWhitelist),
      quickHelpDocs: this.quickHelpDocs,
    }
  }

  readFromJson(obj) {
    if ('isEnabled' in obj) {
      this.isEnabled = obj.isEnabled;
    }
    this.feedType = obj.feedType;
    this.pluginType = obj.pluginType;
    this.pluginUrl = obj.pluginUrl;
    if ('pluginText' in obj) {
      this.pluginText = obj.pluginText;
    }
    if ('quickParser' in obj) {
      this.quickParser.readFromJson(obj.quickParser);
    }
    this.options = jsonToOptions(obj.options);
    if ('domainWhitelist' in obj) {
      this.domainWhitelist = readObjFromJson(obj.domainWhitelist);
    }
    this.quickHelpDocs = obj.quickHelpDocs;
  }

  getFeedType() {
    return this.feedType;
  }

  makeInterpreterInitFunc() {
    let plugin = this;
    return function(interpreter, globalObject) {
      InterpreterUtils.setupInterpreter(plugin, interpreter, globalObject);
    };
  }

  async updateFeeds(feeds) {
    if (!this.isEnabled) {
      return;
    }
    if (this.pluginType == CustomPluginType.Text) {
      await this.updateFeedsFromProgram(feeds, this.pluginText);
    } else if (this.pluginType == CustomPluginType.URL) {
      // TODO - load text
      throw new Error("Not Impl");
    } else if (this.pluginType == CustomPluginType.QuickParse) {
      await this.quickParser.updateFeeds(feeds)
    } else {
      throw new Error(`Unexpected pluginType: \"${this.pluginType}\"`);
    }
  }

  async updateFeedsFromProgram(feeds, programText) {
    let initFunc = this.makeInterpreterInitFunc();
    let interpreter = new Interpreter(programText, initFunc);
    try {
      this.pendingPromises = [];
      for (const feed of feeds) {
        await this.runInterpreter(interpreter, feed);
      }
    } catch(err) {
      console.error(`Caught error running code for FeedType "${this.feedType}":\n${err}`);
      console.error(err.stack);
    }
  }

  async runInterpreter(interpreter, feed) {
    // console.log("Interpreter: ");
    // console.log(interpreter);

    let args = {
      'feed': feed.name
    }
    
    InterpreterUtils.setValue(interpreter, "feed", {"lol": "Hello", "foo": "World"});
    interpreter.appendCode("updateFeed(feed)");

    console.log(`Starting update for FeedType "${this.feedType}", URL: "${feed.url}"`);
    while (true) {
      let moreCode = interpreter.run()
      if (moreCode) {
        // We hit an async function. The interpret `run` will return true until the
        // async function results are ready.
        if (this.pendingPromises.length > 0) {
          // Wait until all dependent promises we must wait for complete
          await Promise.allSettled(this.pendingPromises);
          this.pendingPromises = [];
        } else {
          console.error("Interpreter blocking but no pending promises.");
          await waitMillis(100);
        }
      } else {
        // Done.
        break;
      }
    }

    console.log(`Done update for FeedType "${this.feedType}", URL: "${feed.url}"`);
  }

  isUrlAllowed(urlString) {
    let allowedUrls = [];
    for (const item of this.domainWhitelist) {
      allowedUrls.push(item.value);
    }
    return isDomainInWhitelist(urlString, [this.pluginUrl, ...allowedUrls]);
  }
}

