import {
  addElem, removeElem, hashString,
  optionsToJson, jsonToOptions, waitMillis,
  parseXml, asyncFetchText,
  writeObjToJson, readObjFromJson,
  deepCopyObject, deepCopyArray,
  tryGetSibling, getSiblingNum,
  fatalAssert,
} from './Utils.js'
import { gApp } from './State.js'

function dumpListInfo(listInfo) {
  console.log("ListRootPath: " + listInfo.listRootPath.toStr());
  console.log("ItemPath: " + listInfo.itemPath.toStr());
  console.log("ChildNumDelta: " + listInfo.childNumDelta);
}

function extractText(node) {
  return node.value;
}

function extractUrl(node) {
  // TODO
  return node.value;
}

function extractDate(node) {
  // TODO
  return node.value;
}

function signStr(val) {
  if (val > 0) {
    return '+';
  } else if (val < 0) {
    return '-';
  }
  return '';
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
    } else if (pathItem.deltaType == 'GoSibling') {
      str = `${pathItem.name}_GoSib${signStr(pathItem.siblingDelta)}${pathItem.siblingDelta}`;
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
      } else if (pathItem.deltaType == 'GoSibling') {
        let siblingNum = getSiblingNum(curNode);
        curNode = tryGetSibling(curNode, siblingNum + pathItem.siblingDelta);
        if (!curNode) {
          console.log(`No such sibling found at ${siblingNum + pathItem.siblingDelta}`);
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
  // A: DOC_GoTo0, HTML_GoTo0, BODY_GoTo0, Foo_GoTo0, Bar_GoTo2, Baz_GoTo3
  // B: DOC_GoTo0, HTML_GoTo0, BODY_GoTo0, Foo_GoTo1, Goo_GoTo2, Moo_GoTo3
  // Res: #text_GoUp, Baz_GoUp, Bar_GoSib+1, Goo_GoTo2, Moo_GoTo3 
  static getDelta(pathA, pathB) {
    let prefixPath = DomPath.findCommonPrefixItems(pathA, pathB);
    fatalAssert(prefixPath != 0, "The paths must have a common prefix");
    fatalAssert(pathA.pathItems.length > prefixPath.length + 1
      && pathB.pathItems.length > prefixPath.length + 1);

    let pivotElemA = pathA.pathItems[prefixPath.length + 1];
    let pivotElemB = pathB.pathItems[prefixPath.length + 1];
    let pivotASiblingNum = pathA.pathItems[prefixPath.length].nextChildNum;
    let pivotBSiblingNum = pathB.pathItems[prefixPath.length].nextChildNum;
    fatalAssert(pivotASiblingNum != pivotBSiblingNum);

    let deltaPath = [];
    for (let i = pathA.pathItems.length - 1; i >= prefixPath.length + 1; --i) {
      let item = pathA.pathItems[i];
      // Push a GoUp to get to `item`
      deltaPath.push({name: item.nextName, deltaType: 'GoUp'});
    }
    deltaPath.push({
      deltaType: 'GoSibling',
      siblingDelta: pivotBSiblingNum - pivotASiblingNum,
      name: pivotElemA.name,
      type: pivotElemA.type,
      numChildren: pivotElemA.numChildren,
      nextName: pivotElemA.nextName,
      nextType: pivotElemA.nextType,
    });
    for (let i = prefixPath.length + 1; i < pathB.pathItems.length; ++i) {
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

class ParseField {
  constructor(name) {
    this.name = name;
    this.path = new DomPath(name);
  }

  writeToJson() {
    return {
      path: this.path.writeToJson()
    }
  }

  readFromJson(obj) {
    this.path.readFromJson(obj.path);
  }
}

export class QuickParser {
  constructor() {
    this.testUrl = "";
    this.testFetchContent = null;
    this.testParseOutput = null;

    this.firstItemTitle = new ParseField("First Item Title");
    this.firstItemUrl = new ParseField("First Item Url");
    this.firstItemDate = new ParseField("First Item Date");
    this.firstItemPts = new ParseField("First Item Pts");
    this.firstItemAuthor = new ParseField("First Item Author");
    this.secondItemTitle = new ParseField("Second Item Title");

    this.allFields = [
      this.firstItemTitle,
      this.firstItemUrl,
      this.firstItemDate,
      this.firstItemPts,
      this.firstItemAuthor,
      this.secondItemTitle,
    ]
  }

  writeToJson() {
    return {
      testUrl: this.testUrl,
      firstItemTitle: this.firstItemTitle.writeToJson(),
      firstItemUrl: this.firstItemUrl.writeToJson(),
      firstItemDate: this.firstItemDate.writeToJson(),
      firstItemPts: this.firstItemPts.writeToJson(),
      firstItemAuthor: this.firstItemAuthor.writeToJson(),
      secondItemTitle: this.secondItemTitle.writeToJson(),
    };
  }

  readFromJson(obj) {
    this.testUrl = obj.testUrl;
    if ("firstItemTitle" in obj) {
      this.firstItemTitle.readFromJson(obj.firstItemTitle);
      this.firstItemUrl.readFromJson(obj.firstItemUrl);
      this.firstItemDate.readFromJson(obj.firstItemDate);
      this.firstItemPts.readFromJson(obj.firstItemPts);
      this.firstItemAuthor.readFromJson(obj.firstItemAuthor);
      this.secondItemTitle.readFromJson(obj.secondItemTitle);
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

  updateChosenFlags() {
    this.clearChosenFlags(this.testFetchContent);
    for (const field of this.allFields) {
      let path = field.path;
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

    let isValid = this.validateRequiredFields(jsonDoc);
    if (!isValid) {
      return null;
    }

    // Traverse the item list.
    let listRes = DomPath.detectLogicalList(this.firstItemTitle.path, this.secondItemTitle.path);
    if (listRes.error) {
      console.error("Failed to detect the list of items. Error: ", listRes.error);
      return null;
    }
    let listInfo = listRes.value;
    console.log("TitleA Path: " + this.firstItemTitle.path.toStr());
    console.log("TitleB Path: " + this.secondItemTitle.path.toStr());
    dumpListInfo(listInfo);

    let listRootElem = DomPath.addPath(jsonDoc, listInfo.listRootPath);
    if (!listRootElem) {
      console.error("List parsing failed. Failed to find the list root at: " + listInfo.listRootPath.toStr());
      return null;
    }
    console.log("ListRootElem: ", listRootElem);

    let optionalFields = [
      {key: 'Url', field: this.firstItemUrl, extractFunc: extractUrl},
      {key: 'Author', field: this.firstItemAuthor, extractFunc: extractText},
      {key: 'Date', field: this.firstItemDate, extractFunc: extractDate},
      {key: 'Points', field: this.firstItemPts, extractFunc: extractText},
    ];
    for (const item of optionalFields) {
      if (item.field.path.isEmpty()) {
        continue;
      }
      let concreteItem = DomPath.addPath(jsonDoc, item.field.path);
      if (!concreteItem) {
        console.error(`Failed to find item for field: ${item.field.name}. Please check it.`);
        item.enabled = false;
        continue;
      }
      item.enabled = true;
      item.deltaPath = DomPath.getDelta(this.firstItemTitle.path, item.field.path)
      console.log(`Delta for ${item.field.name}: ${item.deltaPath.toStr()}`);
    }

    let output = [];
    let firstItemDelta = listInfo.itemPath.pathItems[0];
    let curChildNum = firstItemDelta.nextChildNum;
    console.log("Starting list parsing");
    while (output.length < 40) {
      let nextElem = DomPath.addPath(listRootElem, listInfo.itemPath);
      if (!nextElem) {
        console.log("Done list parsing. childNum: " + firstItemDelta.nextChildNum);
        break;
      }
      let obj = {
        itemNum: output.length + 1,
        title: extractText(nextElem),
      }
      for (const item of optionalFields) {
        if (!item.enabled) {
          continue;
        }
        this.applyOptionalItem(nextElem, item, obj);
      }
      output.push(obj);
      firstItemDelta.nextChildNum += listInfo.childNumDelta;
    }

    return output;
  }

  validateRequiredFields(jsonDoc) {
    if (this.firstItemTitle.path.isEmpty()) {
      console.log("Error: the First Item Title is mandatory");
      return false;
    }
    if (this.secondItemTitle.path.isEmpty()) {
      console.log("Error: this Second Item Title is mandatory");
      return false;
    }
    let firstItemAnchor = DomPath.addPath(jsonDoc, this.firstItemTitle.path);
    if (!firstItemAnchor) {
      console.error("Failed to find node for firstItemTitle");
      return false;
    }
    let secondItemAnchor = DomPath.addPath(jsonDoc, this.secondItemTitle.path);
    if (!secondItemAnchor) {
      console.error("Failed to find node for secondItemTitle");
      return false;
    }
    return true;
  }

  applyOptionalItem(anchorElem, item, outputObj) {
    let resolvedObj = DomPath.addPath(anchorElem, item.deltaPath);
    if (!resolvedObj) {
      console.log(`Failed to resolve ${item.field.name} for item ${outputObj.itemNum}`);
      return;
    }
    let extractedVal = item.extractFunc(resolvedObj);
    if (!extractedVal) {
      return;
    }
    outputObj[item.key] = extractedVal;
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

