import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis } from './Utils.js'

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
  Text: 'Text',
};

export class CustomPlugin {
  constructor() {
    this.isEnabled = true;
    this.feedType = "MyPlugin";
    this.pluginType = CustomPluginType.URL;
    this.pluginUrl = "";
    this.pluginText = kDefaultCustomCode;
    this.options = []
    this.quickHelpDocs = "";
  }

  writeToJson() {
    return {
      isEnabled: this.isEnabled,
      feedType: this.feedType,
      pluginType: this.pluginType,
      pluginUrl: this.pluginUrl,
      pluginText: this.pluginText,
      options: optionsToJson(this.options),
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
    this.options = jsonToOptions(obj.options);
    this.quickHelpDocs = obj.quickHelpDocs;
  }

  getFeedType() {
    return this.feedType;
  }

  makeInterpreterInitFunc() {
    let plugin = this;
    return function(interpreter, globalObject) {
      let logPrefix = `${plugin.feedType}: `;
      let logFunc = (logText) => {
        console.log(logPrefix + logText);
      };
      interpreter.setProperty(globalObject, 'log', interpreter.createNativeFunction(logFunc));
    };
  }

  async updateFeeds(feeds) {
    if (!this.isEnabled) {
      return;
    }
    let interpreter = null;
    if (this.pluginType == CustomPluginType.Text) {
      let initFunc = this.makeInterpreterInitFunc();
      interpreter = new Interpreter(this.pluginText, initFunc);
    } else if (this.pluginType == CustomPluginType.URL) {
      // TODO - load text
      throw new Error("Not Impl");
    } else {
      throw new Error(`Unexpected pluginType: \"${this.pluginType}\"`);
    }
    try {
      for (const feed of feeds) {
        await this.runInterpreter(interpreter, feed);
      }
    } catch(err) {
      console.error(`Caught error running code for FeedType "${this.feedType}":\n${err}`);
      console.error(err.stack);
    }
  }

  getValue(interpreter, propName) {
    // let prop = interpreter.getValue(propName);
    let prop = interpreter.getProperty(interpreter.globalObject, propName);
    return interpreter.pseudoToNative(prop);
  }

  setValue(interpreter, propName, propValue) {
    let pseudoPropValue = interpreter.nativeToPseudo(propValue);
    // interpreter.setValue(propName, pseudoPropValue);
    interpreter.setProperty(interpreter.globalObject, propName, pseudoPropValue);
  }

  async runInterpreter(interpreter, feed) {
    // console.log("Interpreter: ");
    // console.log(interpreter);

    let args = {
      'feed': feed.name
    }
    
    // this.setValue(interpreter, "feed", "Hello world!");
    this.setValue(interpreter, "feed", {"lol": "Hello", "foo": "World"});
    interpreter.appendCode("updateFeed(feed)");

    console.log(`Starting update for FeedType "${this.feedType}", URL: "${feed.url}"`);
    while (true) {
      let moreCode = interpreter.run()
      if (moreCode) {
        // Hit an async func. Wait a little then continue. 
        // TODO - how is this handled internally?
        await waitMillis(100);
      } else {
        // Done.
        break;
      }
    }

    console.log(`Done update for FeedType "${this.feedType}", URL: "${feed.url}"`);
  }
}

