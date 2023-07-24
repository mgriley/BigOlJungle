import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, asyncFetchText,
    writeObjToJson, readObjFromJson } from './Utils.js'
import { gApp } from './State.js'

export class DocPath {
  constructor() {
    this.pathItems = [];
  }

  writeToJson() {
    return {
      pathItems: writeObjToJson(this.pathItems)
    }
  }

  readFromJson(obj) {
    if ('pathItems' in obj) {
      this.pathItems = readObjFromJson(obj.pathItems)
    }
  }

  toStr() {
    // return "Not impl";
    if (this.pathItems.length === 0) {
      return "Empty";
    }
    let strItems = [];
    for (let i = 0; i < this.pathItems.length; ++i) {
      let pathItem = this.pathItems[i];
      let childNumOf = i > 0 ? this.pathItems[i - 1].numChildren : 1;
      strItems.push(`${pathItem.name.toLowerCase()}_${pathItem.childNum + 1}_${childNumOf}`);
    }
    return strItems.join(" / ");
  }

  toShortStr() {
    if (this.pathItems.length === 0) {
      return "Empty";
    }
    let item = this.pathItems[this.pathItems.length - 1];
    return `.../${item.name.toLowerCase()}`;
  }

  setFromNodeData(nodeData) {
    // console.log("Setting from nodeData");
    this.pathItems = [];
    let curNode = nodeData;
    while (curNode) {
      this.pathItems.push({childNum: curNode.childNum, numChildren: curNode.children.length,
        name: curNode.name, type: curNode.type});
      curNode = curNode.parent;
    }
    this.pathItems.reverse();
  }

  clear() {
    this.pathItems = [];
  }

  // Returns null if not found
  lookupNode(nodeTree) {
    if (this.pathItems.length === 0) {
      return null;
    }
    let curNode = nodeTree;
    for (let i = 1; i < this.pathItems.length; ++i) {
      let pathItem = this.pathItems[i];
      if (pathItem.childNum < curNode.children.length) {
        curNode = curNode.children[pathItem.childNum];
      } else {
        return null;
      }
    }
    return curNode;
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
    this.firstItemAuthorPath = new DocPath();
    this.secondItemTitlePath = new DocPath();
  }

  writeToJson() {
    return {
      testUrl: this.testUrl,
      firstItemTitlePath: this.firstItemTitlePath.writeToJson(),
      firstItemUrlPath: this.firstItemUrlPath.writeToJson(),
      firstItemDatePath: this.firstItemDatePath.writeToJson(),
      firstItemPtsPath: this.firstItemPtsPath.writeToJson(),
      firstItemAuthorPath: this.firstItemAuthorPath.writeToJson(),
      secondItemTitlePath: this.secondItemTitlePath.writeToJson(),
    };
  }

  readFromJson(obj) {
    this.testUrl = obj.testUrl;
    if ("firstItemTitlePath" in obj) {
      this.firstItemTitlePath.readFromJson(obj.firstItemTitlePath);
      this.firstItemUrlPath.readFromJson(obj.firstItemUrlPath);
      this.firstItemDatePath.readFromJson(obj.firstItemDatePath);
      this.firstItemPtsPath.readFromJson(obj.firstItemPtsPath);
      this.firstItemAuthorPath.readFromJson(obj.firstItemAuthorPath);
      this.secondItemTitlePath.readFromJson(obj.secondItemTitlePath);
    }
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

  addHelperData(node, parentNode, childNum) {
    // Add parent pointers and childNum data.
    node.parent = parentNode;
    node.childNum = childNum;
    node.isChosen = false;
    for (let i = 0; i < node.children.length; ++i) {
      this.addHelperData(node.children[i], node, i);
    }
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

    this.addHelperData(jsonDoc, null, 0);
    this.testFetchContent = jsonDoc;
    this.updateChosenFlags();
  }

  clearChosenFlags(node) {
    node.isChosen = false;
    for (const child of node.children) {
      this.clearChosenFlags(child);
    }
  }

  getAllDomPaths() {
    return [
      this.firstItemTitlePath,
      this.firstItemUrlPath,
      this.firstItemAuthorPath,
      this.firstItemDatePath,
      this.firstItemPtsPath,
      this.secondItemTitlePath,
    ]
  }

  updateChosenFlags() {
    this.clearChosenFlags(this.testFetchContent);
    let paths = this.getAllDomPaths();
    for (const path of paths) {
      let node = path.lookupNode(this.testFetchContent);
      if (node) {
        node.isChosen = true;
      }
    }
  }

  setPathFromNodeData(domPath, nodeData) {
    domPath.setFromNodeData(nodeData);
    this.updateChosenFlags();
  }

  async runTestParse() {
    this.testParseOutput = null;
    // TODO
  }
}

