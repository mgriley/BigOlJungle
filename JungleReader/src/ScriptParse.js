import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson, valOr } from './Utils.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { gApp } from './State.js'
//import * as babel from "@babel/core";

const kDefaultCustomCode = (`

function updateFeed(feedUrl, customOptions) {
  log("The feed: " + feedUrl);
  logJs(customOptions);

  return [{
    title: "Hello World",
    description: "Some description", // Optional
    link: "https://google.com", // Optional
    pubDate: "Thu, 20 Dec 2022 02:46:11 UTC", // Optional
  }];
}

`)

class ScriptRunner {
  constructor(plugin, scriptText, feed) {
    this.plugin = plugin;
    this.scriptText = scriptText;
    this.feed = feed;
  }

  async run() {
    // TODO - defer this.
    // Transpile ES6 to ES5. The interpreter only supports ES5
    //let compiledCode = babel.transformSync(code, {'presets': ['es2015']}).code;

    let interpreterInputs = {
      plugin: this.plugin,
      feed: this.feed,
      pendingPromises: [],
    };
    let initFunc = function(interpreter, globalObject) {
      InterpreterUtils.setupInterpreter(interpreterInputs, interpreter, globalObject);
    };
    let interpreter = new Interpreter(this.scriptText, initFunc);

    let optionsDict = {};
    for (const option in this.feed.options) {
      optionsDict[option.key] = option.value;
    }
    InterpreterUtils.setValue(interpreter, "feedUrl", this.feed.url);
    InterpreterUtils.setValue(interpreter, "customOptions", optionsDict);
    interpreter.appendCode("var _finalResult = updateFeed(feedUrl, customOptions);");

    console.log(`Starting update for FeedType "${this.plugin.feedType}", URL: "${this.feed.url}"`);
    while (true) {
      let moreCode = interpreter.run()
      if (moreCode) {
        // We hit an async function. The interpret `run` will return true until the
        // async function results are ready.
        if (interpreterInputs.pendingPromises.length > 0) {
          // Wait until all dependent promises we must wait for complete
          await Promise.allSettled(interpreterInputs.pendingPromises);
          interpreterInputs.pendingPromises = [];
        } else {
          console.error("Interpreter blocking but no pending promises.");
          await waitMillis(100);
        }
      } else {
        // Done.
        break;
      }
    }

    let result = InterpreterUtils.getValue(interpreter, "_finalResult");
    console.log(`Done script for FeedType "${this.plugin.feedType}", URL: "${this.feed.url}". ` +
      ` Updating links with result:\n${result}`);

    if (result instanceof Array) {
      // We allow returning a list of items, for convenience, instead of the whole struct.
      // Convert to the whole struct here.
      result = {
        items: result
      }
    }
    this.feed.updateLinks(result);

    return result;
  }
};

export async function updateFeedFromScript(plugin, scriptText, feed) {
  let parser = new ScriptParser(plugin);
  parser.pluginText = scriptText;
  return await parser.updateFeed(feed);
}

export class ScriptParser {
  constructor(plugin) {
    this.plugin = plugin;
    this.pluginText = kDefaultCustomCode;
    this.testUrl = "";
  }

  writeToJson() {
    return {
      pluginText: this.pluginText,
      testUrl: this.testUrl
    }
  }

  readFromJson(obj) {
    this.pluginText = obj.pluginText;
    this.testUrl = valOr(obj.testUrl, "");
  }

  async updateFeed(feed) {
    let scriptRunner = new ScriptRunner(this.plugin, this.pluginText, feed); 
    return await scriptRunner.run();
  }
};

