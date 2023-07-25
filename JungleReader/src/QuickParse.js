import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, asyncFetchText,
    writeObjToJson, readObjFromJson, deepCopyObject } from './Utils.js'
import { gApp } from './State.js'

export class DomPath {
  constructor(name) {
    this.name = name;
    // Really more like a list of `deltas`
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

  isEmpty() {
    return this.pathItems.length === 0;
  }

  toStr() {
    // return "Not impl";
    if (this.pathItems.length === 0) {
      return "Empty";
    }
    let strItems = [];
    for (let i = 0; i < this.pathItems.length; ++i) {
      let pathItem = this.pathItems[i];
      let str = "";
      if (pathItem.deltaType == 'GoDown') {
        str = `GoDown to ${pathItem.nextChildNum}`;
      } else if (pathItem.deltaType == 'GoUp') {
        str = "GoUp";
      }
      strItems.push(str);
    }
    return strItems.join(" -> ");
  }

  toShortStr() {
    return this.toStr();
    /*
    if (this.pathItems.length === 0) {
      return "Empty";
    }
    let item = this.pathItems[this.pathItems.length - 1];
    return `.../${item.name.toLowerCase()}`;
    */
  }

  setFromNodeData(nodeData) {
    this.pathItems = [];
    if (!nodeData) {
      return;
    }
    let curNode = nodeData;
    while (curNode.parent) {
      let pathItem = {
        deltaType: 'GoDown',
        name: curNode.parent.name,
        type: curNode.parent.type,
        nextName: curNode.name,
        nextType: curNode.type,
        nextChildNum: curNode.childNum,
        numChildren: curNode.parent.children.length,
      };
      this.pathItems.push(pathItem);
      curNode = curNode.parent;
    }
    this.pathItems.reverse();
  }

  clear() {
    this.pathItems = [];
  }

  // Returns newNode = node + path, or null if not found
  static addPath(rootNode, path) {
    if (path.pathItems.length === 0) {
      return rootNode;
    }
    let curNode = rootNode;
    for (let i = 0; i < path.pathItems.length; ++i) {
      let pathItem = path.pathItems[i];
      if (pathItem.deltaType == 'GoDown') {
        if (pathItem.nextChildNum < curNode.children.length) {
          curNode = curNode.children[pathItem.nextChildNum];
        } else {
          return null;
        }
      } else if (pathItem.deltaType == 'GoUp') {
        curNode = curNode.parent;
        if (!curNode) {
          return null;
        }
      }
    }
    return curNode;
  }

  static pathItemsEqual(itemA, itemB) {
    return JSON.stringify(itemA) == JSON.stringify(itemB);
  }

  static findCommonPrefixItems(pathA, pathB) {
    let prefix = [];
    for (let i = 0; i < pathA.pathItems.length && i < pathB.pathItems.length; ++i) {
      if (!DomPath.pathItemsEqual(pathA.pathItems[i], pathB.pathItems[i])) {
        break;
      }
      prefix.push(deepCopyObject(pathA.pathItems.length));
    }
    return prefix;
  }

  // Returns pathA - pathB, or null on failure
  // Both paths must cannot have any 'up' paths.
  static getDelta(pathA, pathB) {
    let prefixPath = DomPath.findCommonPrefixItems(pathA, pathB);
    let deltaPath = [];
    for (let i = 0; i < pathA.pathItems.length - prefixPath.length; ++i) {
      deltaPath.push({deltaType: 'GoUp'});
    }
    for (let i = prefixPath.length; i < pathB.pathItems.length; ++i) {
      deltaPath.push(deepCopyObject(pathB.pathItems[i]));
    }
    let domPath = new DomPath("Delta");
    domPath.pathItems = deltaPath;
    return domPath;
  }
}

export class QuickParser {
  constructor() {
    this.testUrl = "";
    this.testFetchContent = null;
    this.testParseOutput = null;

    this.firstItemTitlePath = new DomPath("First Item Title");
    this.firstItemUrlPath = new DomPath("First Item Url");
    this.firstItemDatePath = new DomPath("First Item Date");
    this.firstItemPtsPath = new DomPath("First Item Pts");
    this.firstItemAuthorPath = new DomPath("First Item Author");
    this.secondItemTitlePath = new DomPath("Second Item Title");
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
    // TODO - fetch the text. Parse using the DomPaths
  }

  addHelperData(node, parentNode, childNum) {
    // Add parent pointers and childNum data.
    node.parent = parentNode;
    node.childNum = childNum;
    node.isChosen = false;
    node.helperText = "";
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
    node.helperText = "";
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
      if (path.isEmpty()) {
        continue;
      }
      let node = DomPath.addPath(this.testFetchContent, path);
      if (node) {
        node.isChosen = true;
        node.helperText = node.helperText ? `${node.helperText}, ${path.name}` : path.name;
      }
    }
  }

  setPathFromNodeData(domPath, nodeData) {
    domPath.setFromNodeData(nodeData);
    this.updateChosenFlags();
  }

  clearPath(domPath) {
    domPath.clear();
    this.updateChosenFlags();
  }

  getTextValue(node) {
    // TODO - handle a few different variations
    return node.value;
  }

  async parsePage(pageUrl) {
    let pageHtml = await asyncFetchText(gApp.makeCorsProxyUrl(pageUrl));
    if (!pageHtml) {
      // TODO - show an error toast
      console.error("Failed to fetch content from the URL. Please check it.");
      return null;
    }
    let jsonDoc = null;
    try {
      jsonDoc = parseXml(pageHtml, "text/html");
    } catch (error) {
      console.error(error);
      return null;
    }

    if (this.firstItemTitlePath.isEmpty()) {
      console.log("Error: the First Item Title is mandatory");
      return null;
    }
    if (this.secondItemTitlePath.isEmpty()) {
      console.log("Error: this Second Item Title is mandatory");
      return null;
    }
    let firstItemAnchor = DomPath.addPath(jsonDoc, this.firstItemTitlePath);
    if (!firstItemAnchor) {
      console.error("Failed to find node for firstItemTitle");
      return null;
    }
    let secondItemAnchor = DomPath.addPath(jsonDoc, this.secondItemTitlePath);
    if (!secondItemAnchor) {
      console.error("Failed to find node for secondItemTitle");
      return null;
    }

    // Traverse the item list
    let output = [];
    let anchorDelta = DomPath.getDelta(this.firstItemTitle, this.secondItemTitle);
    let curAnchor = firstItemAnchor;
    while (curAnchor) {
      let obj = {
        title: this.getTextValue(curAnchor),
      }
      output.push(obj);
      curAnchor = DomPath.addPath(curAnchor, anchorDelta);
      if (!curAnchor) {
        // Finished list
        break;
      }
    }

    return output;
  }

  async runTestParse() {
    this.testParseOutput = null;
    let linkData = parsePage(this.testUrl);
    if (linkData == null) {
      console.error("Test parse failed");
      return;
    }
    this.testParseOutput = JSON.stringify(this.testParseOutput, null, 2);
  }
}

