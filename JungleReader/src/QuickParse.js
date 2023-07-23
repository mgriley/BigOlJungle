import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, asyncFetchText } from './Utils.js'
import { gApp } from './State.js'

export class DocPath {
  constructor() {
    // TODO
  }
}

export class QuickParser {
  constructor() {
    this.testUrl = "";
    this.testFetchContent = null;
    this.testParseOutput = null;
    this.firstItemTitlePath = new DocPath();
    this.firstItemUrlPath = new DocPath();
    this.firstItemDatePath = new DocPath();
    this.firstItemPtsPath = new DocPath();
  }

  writeToJson() {
    return {
      testUrl: this.testUrl,
    };
  }

  readFromJson(obj) {
    this.testUrl = obj.testUrl;
  }

  async updateFeeds(feeds) {
    for (const feed of feeds) {
      try {
        await this.updateFeed(feed);
      } catch (err) {
        console.error(`Error updating plugin "${feed.name}":\n${err}`, err.stack);
      }
    }
  }

  async updateFeed(feed) {
    // TODO - fetch the text. Parse using the DocPaths
  }

  async fetchTestContent() {
    this.testFetchContent = null;
    if (!this.testUrl) {
      console.error("You must set the Test URL first");
      return;
    }
    let testHtml = await asyncFetchText(gApp.makeCorsProxyUrl(this.testUrl));
    if (!testHtml) {
      // TODO - show an error toast
      console.error("Failed to fetch content from the test URL. Please check it.");
      return;
    }

    let jsonDoc = null;
    try {
      jsonDoc = parseXml(testHtml, "text/html");
    } catch (error) {
      console.error(error);
      return;
    }
    this.testFetchContent = jsonDoc;
  }

  async runTestParse() {
    this.testParseOutput = "";
    // TODO
  }
}

