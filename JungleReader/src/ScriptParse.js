import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson, valOr } from './Utils.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { gApp } from './State.js'

const kDefaultCustomCode = (`

function updateFeed(feed) {
  log("Hello world!");
  log(JSON.stringify(feed));
  // TODO - updateFeed(feed, linkData);
}

`)

class ScriptRunner {
  constructor(plugin, scriptText, feed) {
    this.plugin = plugin;
    this.scriptText = scriptText;
    this.feed = feed;
  }

  async run() {
    let interpreterInputs = {
      plugin: this.plugin,
      pendingPromises: [],
    };
    let initFunc = function(interpreter, globalObject) {
      InterpreterUtils.setupInterpreter(interpreterInputs, interpreter, globalObject);
    };
    let interpreter = new Interpreter(this.scriptText, initFunc);

    let args = {
      'feed': this.feed.name
    }
    InterpreterUtils.setValue(interpreter, "feed", {"lol": "Hello", "foo": "World"});
    interpreter.appendCode("updateFeed(feed)");

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

    console.log(`Done update for FeedType "${this.plugin.feedType}", URL: "${this.feed.url}"`);
  }
};

export async function updateFeedFromScript(plugin, scriptText, feed) {
  let scriptRunner = new ScriptRunner(plugin, scriptText, feed); 
  await scriptRunner.run();
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
    await updateFeedFromScript(this.plugin, this.pluginText, feed);
  }
};

