import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, isDomainInWhitelist,
    writeObjToJson, readObjFromJson, valOr,
    secsSinceDate } from './Utils.js'
import * as InterpreterUtils from './InterpreterUtils.js'
import { gApp } from './State.js'
//import * as babel from "@babel/core";

const kMaxScriptTimeSecs = 3;
const kMaxScriptMemoryBytes = 50*1000*1000;

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

// Taken from JS-Interpreter docs.
// See Security section: https://neil.fraser.name/software/JS-Interpreter/docs.html
// Measures the rough value in bytes of the given JS value
function estimateMemoryBytes(value) {
  const measured = new Set();
  let notMeasured = [value];
  let bytes = 0;

  while (notMeasured.length) {
    const val = notMeasured.pop();
    bytes += 8;  // Rough estimate of overhead per value.

    const type = typeof val;
    if (type === 'string' && !measured.has(val)) {
      // Assume that the native JS environment has a string table
      // and that each string is only counted once.
      bytes += val.length * 2;
      measured.add(val);
    } else if (type === 'object' && val !== null && !measured.has(val)) {
      for (const key in val) {
        notMeasured.push(key);
        notMeasured.push(val[key]);
      }
      measured.add(val);
    } else {
      // Non compound type. We already did bytes += 8, so fine
    }
  }
  return bytes;
}

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
    let startTime = new Date();
    let peakMemBytes = 0;
    let didFinish = false;
    while (secsSinceDate(startTime) < kMaxScriptTimeSecs) {
      let moreCode = interpreter.step()
      if (!moreCode) {
        // Done
        didFinish = true;
        break;
      }
      // Wait for any pendingPromises to finish before continuing
      if (interpreterInputs.pendingPromises.length > 0) {
        // Wait until all dependent promises we must wait for complete
        await Promise.allSettled(interpreterInputs.pendingPromises);
        interpreterInputs.pendingPromises = [];
      }
      let curMemBytes = estimateMemoryBytes(interpreter.getStateStack());
      peakMemBytes = Math.max(curMemBytes, peakMemBytes);
      if (curMemBytes > kMaxScriptMemoryBytes) {
        throw new Error(`Script exceeded the memory limit of ${kMaxScriptMemoryBytes.toLocaleString()}B`);
      }
    }
    if (!didFinish) {
      throw new Error(`Script timed out after ${kMaxScriptTimeSecs}s`);
    }
    let scriptTime = secsSinceDate(startTime);
    let peakMemKB = Math.round(peakMemBytes / 1000);
    //let maxMemKB = Math.round(kMaxScriptMemoryBytes / 1000);
    console.log(`Script done. Time: ${scriptTime}s ` +
      `PeakMem: ${peakMemKB}KB`);

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

