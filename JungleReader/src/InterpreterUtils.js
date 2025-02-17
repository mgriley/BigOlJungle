import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, formatXML, prettifyElement } from './Utils.js'
import { gApp } from './State.js'

export function getValue(interpreter, propName) {
  // let prop = interpreter.getValue(propName);
  let prop = interpreter.getProperty(interpreter.globalObject, propName);
  return interpreter.pseudoToNative(prop);
}

export function setValue(interpreter, propName, propValue) {
  let pseudoPropValue = interpreter.nativeToPseudo(propValue);
  // interpreter.setValue(propName, pseudoPropValue);
  interpreter.setProperty(interpreter.globalObject, propName, pseudoPropValue);
}

function registerFunc(interpreter, obj, funcName, func) {
  interpreter.setProperty(obj, funcName, interpreter.createNativeFunction(func));
}

function registerAsyncFunc(interpreter, obj, funcName, func) {
  interpreter.setProperty(obj, funcName, interpreter.createAsyncFunction(func));
}

function setupBasicFuncs(registry) {
  let feedType = registry.state.plugin.feedType;
  let logPrefix = ``;

  registry.addFunc("abort", (abortMsg) => {
    let msg = `${logPrefix}Aborted with error: ${abortMsg}`
    console.log(msg);
    throw new Error(msg);
  });

  registry.addFunc("log", (logText) => {
    console.log(logPrefix + logText);
  });
  registry.addFunc("logJs", (jsObj) => {
    let nativeValue = registry.interpreter.pseudoToNative(jsObj);
    let str = JSON.stringify(nativeValue, null, 2);
    console.log(logPrefix + str);
  });
  registry.addFunc("logJson", (jsonStr) => {
    let nativeValue = registry.interpreter.pseudoToNative(jsonStr);
    let str = JSON.stringify(JSON.parse(nativeValue), null, 2);
    console.log(logPrefix + str);
  });
  registry.addFunc("logXml", (xmlStr) => {
    let nativeValue = registry.interpreter.pseudoToNative(xmlStr);
    console.log(logPrefix + formatXML(nativeValue));
  });

  registry.addFunc("parseJson", (jsonString) => {
    let js = JSON.parse(jsonString);
    return registry.interpreter.nativeToPseudo(js);
  });
  registry.addFunc("parseXml", (xmlString) => {
    let js = parseXml(xmlString, "text/xml");
    return registry.interpreter.nativeToPseudo(js);
  });
  registry.addFunc("parseHtml", (htmlString) => {
    let js = parseXml(htmlString, "text/html");
    return registry.interpreter.nativeToPseudo(js);
  });

  registry.addFunc("stringify", (jsObj) => {
    let nativeValue = registry.interpreter.pseudoToNative(jsObj);
    return JSON.stringify(nativeValue, null, 2);
  });
}

function setupDocumentFuncs(registry) {
  // stringType: "html", "xml", or "json"
  registry.addFunc("parseToJs", (string, stringType) => {
    let js = null;
    if (stringType == "html" || stringType == "xml") {
      js = parseXml(string, "text/" + stringType);
    } else if (stringType == "json") {
      js = JSON.parse(string);
    } else {
      throw new Error("Unsupported stringType: " + stringType);
    }
    return registry.interpreter.nativeToPseudo(js);
  });
  // stringType: "html" or "xml"
  registry.addFunc("parseToDoc", (string, stringType) => {
    if (!(stringType == "html" || stringType == "xml")) {
      throw new Error("Unsupported stringType: " + stringType);
    }
    let doc = (new DOMParser()).parseFromString(xmlString, "text/" + stringType);
    return registry.objTable.add(dom);
  });

  // Traversal
  registry.addFunc("getParent", (elemHandle) => {
    let elemParent = registry.objTable.get(elemHandle).parentNode;
    return registry.objTable.add(elemParent);
  });
  registry.addFunc("getChildren", (elemHandle) => {
    let elemChildren = registry.objTable.get(elemHandle).children();
    let childHandles = [];
    for (const child of elemChildren) {
      childHandles.push(registry.objTable.add(child));
    }
    return childHandles;
  });
  registry.addFunc("getNextSibling", (elemHandle) => {
    let elemNext = registry.objTable.get(elemHandle).nextElementSibling;
    return registry.objTable.add(elemNext);
  });
  registry.addFunc("getPrevSibling", (elemHandle) => {
    let elemPrev = registry.objTable.get(elemHandle).previousElementSibling;
    return registry.objTable.add(elemPrev);
  });

  // Properties
  registry.addFunc("getNodeType", (elemHandle) => {
    let elem = registry.objTable.get(elemHandle);
    return elem.nodeType;
  });
  registry.addFunc("getNodeName", (elemHandle) => {
    let elem = registry.objTable.get(elemHandle);
    return elem.nodeName;
  });
  registry.addFunc("getNodeValue", (elemHandle) => {
    let elem = registry.objTable.get(elemHandle);
    return elem.nodeValue;
  });
  registry.addFunc("getAttr", (elemHandle, attrName) => {
    let elem = registry.objTable.get(elemHandle);
    return elem.getAttribute(attrName);
  });
  registry.addFunc("getInnerHTML", (elemHandle) => {
    let elem = registry.objTable.get(elemHandle);
    return elem.innerHTML;
  });

  // Querying
  // TODO - do more later (getElementById, querySelector, etc.)
  // See: https://www.javascripttutorial.net/javascript-dom/
}

function setupFetchFuncs(registry) {
  // Fetches the doc at the given URL and returns response.text() as a string.
  // Aborts the script on failure.
  registry.addAsyncFunc("fetchText",
    (urlString, fetchOptions, callback) => {
      console.log(`Fetching ${urlString}...`);
      if (!registry.state.plugin.isUrlAllowed(registry.state.feed, urlString)) {
        throw new Error(`URL "${urlString}" is not in the whitelist for plugin ${registry.state.plugin.feedType}. ` +
                        `The whitelist is user-entered feedUrl + user-entered domain whitelist.`);
      }
      let nativeOptions = registry.interpreter.pseudoToNative(fetchOptions);
      let fetchPromise = gApp.fetchText(urlString, nativeOptions).then((text) => {
        console.log("Fetch done");
        callback(text);
      }).catch((error) => {
        console.error(`Error on fetch \"${urlString}\":`, error);
        // Note: we purposefully abort with error in this case.
        throw(error);
      });
      registry.state.pendingPromises.push(fetchPromise);
    });
}

class ObjTable {
  constructor() {
    this.objCtr = 1;
    this.objMap = {};
  }

  add(obj) {
    let objId = this.objCtr;
    this.objMap[objId] = obj;
    this.objCtr++;
    return objId;
  }

  get(objId) {
    return this.objMap[objId];
  }

  remove(objId) {
    delete this.objMap[objId];
  }
}

class RegistryUtil {
  constructor(state, interpreter, globalObject, objTable) {
    this.state = state;
    this.interpreter = interpreter;
    this.globalObject = globalObject;
    this.objTable = objTable;
  }
  
  addFunc(funcName, func) {
    registerFunc(this.interpreter, this.globalObject, funcName, func);
  }

  addAsyncFunc(funcName, func) {
    registerAsyncFunc(this.interpreter, this.globalObject, funcName, func);
  }
}

export function setupInterpreter(state, interpreter, globalObject) {
  let objTable = new ObjTable();
  let registry = new RegistryUtil(state, interpreter, globalObject, objTable);
  setupBasicFuncs(registry);
  // setupDocumentFuncs(registry);
  setupFetchFuncs(registry);
}

