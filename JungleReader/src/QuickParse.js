import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, asyncFetchText,
    writeObjToJson, readObjFromJson,
    deepCopyObject, deepCopyArray } from './Utils.js'
import { gApp } from './State.js'

function dumpListInfo(listInfo) {
  console.log("ListRootPath: " + listInfo.listRootPath.toStr());
  console.log("ItemPath: " + listInfo.itemPath.toStr());
  console.log("ChildNumDelta: " + listInfo.childNumDelta);
}

export class DomPath {
  constructor(name, pathItems=[]) {
    this.name = name;
    // Really more like a list of `deltas`
    this.pathItems = pathItems;
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
      strItems.push(DomPath.itemToStr(pathItem));
    }
    return strItems.join(" -> ");
  }

  static itemToStr(pathItem) {
    let str = "";
    if (pathItem.deltaType == 'GoDown') {
      str = `${pathItem.name}_${pathItem.nextName}_GoTo${pathItem.nextChildNum}`;
    } else if (pathItem.deltaType == 'GoUp') {
      str = `${pathItem.name}_GoUp`;
    }
    return str;
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
  static addPath(rootNode, path, debug=false) {
    if (path.pathItems.length === 0) {
      return rootNode;
    }
    let curNode = rootNode;
    for (let i = 0; i < path.pathItems.length; ++i) {
      let pathItem = path.pathItems[i];
      if (debug) {
        console.log(`At node ${curNode.name}:`, curNode);
      }
      if (pathItem.deltaType == 'GoDown') {
        if (pathItem.nextChildNum < curNode.children.length) {
          curNode = curNode.children[pathItem.nextChildNum];
        } else {
          console.log("Child out of range");
          return null;
        }
      } else if (pathItem.deltaType == 'GoUp') {
        curNode = curNode.parent;
        if (!curNode) {
          console.log("No parent found");
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
      prefix.push(deepCopyObject(pathA.pathItems[i]));
    }
    return prefix;
  }

  // Returns pathA - pathB, or null on failure
  // Both paths cannot have any 'up' paths, and they must share some common prefix.
  // Ex.
  // A: DOC_GoTo0, HTML_GoTo0, BODY_GoTo0, DIV1_GoTo0, DIV2_GoTo2, DIV3_GoTo3
  // B: DOC_GoTo0, HTML_GoTo0, BODY_GoTo0, DIV1_GoTo1, DIV2_GoTo2, DIV3_GoTo3
  // O: #text_GoUp, DIV3_GoUp, DIV2_GoUp, DIV1_GoUp, DIV1_GoTo1, DIV2_GoTo2, DIV3_GoTo3 
  // TODO -  not as useful as I would've thought. Refactor to ret ancestor info.
  static getDelta(pathA, pathB) {
    let prefixPath = DomPath.findCommonPrefixItems(pathA, pathB);
    if (prefixPath == 0) {
      throw new Error("The paths must have common prefix");
    }
    let deltaPath = [];
    for (let i = pathA.pathItems.length - 1; i >= prefixPath.length; --i) {
      let item = pathA.pathItems[i];
      // Push a GoUp to get to `item`
      deltaPath.push({name: item.nextName, deltaType: 'GoUp'});
    }
    for (let i = prefixPath.length; i < pathB.pathItems.length; ++i) {
      deltaPath.push(deepCopyObject(pathB.pathItems[i]));
    }
    let domPath = new DomPath("Delta");
    domPath.pathItems = deltaPath;
    return domPath;
  }

  // Takes: pathA to Item1 and pathB to Item2 within some logical dom list
  // Returns a {value, error} object
  static detectLogicalList(pathA, pathB) {
    let prefixPath = DomPath.findCommonPrefixItems(pathA, pathB);
    if (prefixPath.length == 0) {
      return {error: "The paths must have common prefix"};
    }
    if (!(pathA.pathItems.length > prefixPath.length &&
      pathB.pathItems.length > prefixPath.length)) {
      return {error: "The two paths must be items within some parent list element"};
    }
    // The listRoot should be the delta from the last common elem to a subchild elem.
    // So: the name/type should match, but the nextChildNum should differ.
    // The structure from listRoot -> someItem should be the same for A and B, otherwise we
    // won't be able to traverse the list properly.
    let listRootA = pathA.pathItems[prefixPath.length];
    let listRootB = pathB.pathItems[prefixPath.length];
    if (!(listRootA.name == listRootB.name && listRootA.type == listRootB.type
      && listRootA.nextChildNum != listRootB.nextChildNum)) {
      return {error: "Unable to find a proper list root."};
    }
    if (pathA.pathItems.length !== pathB.pathItems.length) {
      return {error: "The two item paths must have the same number of elements."};
    }
    for (let i = prefixPath.length + 1; i < pathA.pathItems.length; ++i) {
      let itemA = pathA.pathItems[i];
      let itemB = pathB.pathItems[i];
      if (itemA.nextChildNum !== itemB.nextChildNum) {
        return {error: "The paths to item A and item B are not structurally the same. " +
          `Failed to detect the list. Failed at item ${i+1}/${pathA.pathItems.length}: ` +
          `${DomPath.itemToStr(itemA)} vs ${DomPath.itemToStr(itemB)}`};
      }
    }
    let childNumDelta = listRootB.nextChildNum - listRootA.nextChildNum;
    let itemPath = [deepCopyObject(listRootA),
      ...deepCopyArray(pathB.pathItems, prefixPath.length + 1)];
    return {
      value: {
        listRootPath: new DomPath("ListRootPath", deepCopyArray(prefixPath)),
        childNumDelta: childNumDelta,
        itemPath: new DomPath("ItemPath", itemPath)
      }
    }
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
    this.addHelperData(jsonDoc, null, 0);

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

    // Traverse the item list.
    let listRes = DomPath.detectLogicalList(this.firstItemTitlePath, this.secondItemTitlePath);
    if (listRes.error) {
      console.error("Failed to detect the list of items. Error: ", listRes.error);
      return null;
    }
    let listInfo = listRes.value;
    console.log("TitleA Path: " + this.firstItemTitlePath.toStr());
    console.log("TitleB Path: " + this.secondItemTitlePath.toStr());
    dumpListInfo(listInfo);

    let listRootElem = DomPath.addPath(jsonDoc, listInfo.listRootPath);
    if (!listRootElem) {
      console.error("List parsing failed. Failed to find the list root at: " + listInfo.listRootPath.toStr());
      return null;
    }
    console.log("ListRootElem: ", listRootElem);

    let output = [];
    let firstItemDelta = listInfo.itemPath.pathItems[0];
    let curChildNum = firstItemDelta.nextChildNum;
    console.log("Starting list parsing");
    while (output.length < 40) {
      let nextElem = DomPath.addPath(listRootElem, listInfo.itemPath, true);
      if (!nextElem) {
        console.log("Done list parsing. childNum: " + firstItemDelta.nextChildNum);
        break;
      }
      let obj = {
        itemNum: output.length + 1,
        title: this.getTextValue(nextElem),
      }
      output.push(obj);
      firstItemDelta.nextChildNum += listInfo.childNumDelta;
    }

    return output;
  }

  async runTestParse() {
    this.testParseOutput = null;
    let linkData = await this.parsePage(this.testUrl);
    if (linkData == null) {
      console.error("Test parse failed");
      return;
    }
    this.testParseOutput = JSON.stringify(linkData, null, 2);
  }
}

