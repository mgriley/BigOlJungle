import { addElem, removeElem, hashString,
    optionsToJson, jsonToOptions, waitMillis,
    parseXml, formatXML } from './Utils.js'

function registerFunc(interpreter, obj, funcName, func) {
  interpreter.setProperty(obj, funcName, interpreter.createNativeFunction(func));
}

function registerAsyncFunc(interpreter, obj, funcName, func) {
  interpreter.setProperty(obj, funcName, interpreter.createAsyncFunction(func));
}

function setupBasicFuncs(registry) {
  let logPrefix = `${registry.plugin.feedType}: `;
  registry.addFunc("log", (logText) => {
    console.log(logPrefix + logText);
  });
  registry.addFunc("logError", (logText) => {
    console.error(logPrefix + logText);
  });
  /*
  // Note: does not work as expected. Use built-in JSON.stringify.
  registerFunc(interpreter, globalObject, "prettify", (jsObj) => {
    return JSON.stringify(jsObj, null, 2);
  });
  */

  // TODO - generalize to different content types, too.
  registry.addFunc("prettifyXML", (xmlString) => {
    return formatXML(xmlString);
  });
}

function setupDocumentFuncs(registry) {
  // mimeType should be "text/html" or "text/xml"
  // TODO - allow passing "html", "xml", or "json"
  registry.addFunc("parseToJs", (xmlString, mimeType) => {
    let js = parseXml(htmlString, mimeType);
    return registry.interpreter.nativeToPseudo(js);
  });
  // mimeType should be "text/html" or "text/xml"
  registry.addFunc("parseToDoc", (xmlString, mimeType) => {
    let doc = (new DOMParser()).parseFromString(xmlString, mimeType);
    return registry.objTable.add(dom);
  });

  // TODO - add familiar DOM funcs
}

function setupFetchFuncs(registry) {
  registry.addAsyncFunc("fetchText",
    (urlString, fetchOptions, callback) => {
      let corsUrl = registry.plugin.app.makeCorsProxyUrl(urlString).toString();
      let fetchPromise = fetch(corsUrl, fetchOptions).then((response) => {
        return response.text();
      }).then((text) => {
        callback(registry.interpreter.nativeToPseudo({value: text, error: null}));
      }).catch((error) => {
        console.error(`Error on fetch \"${urlString}\":`, error);
        callback(registry.interpreter.nativeToPseudo({value: null, error: error.message}));
      });
      registry.plugin.pendingPromises.push(fetchPromise);
    });

  // TODO - add fetch utils. 
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
  constructor(plugin, interpreter, globalObject, objTable) {
    this.plugin = plugin;
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

export function setupInterpreter(plugin, interpreter, globalObject) {
  let objTable = new ObjTable();
  let registry = new RegistryUtil(plugin, interpreter, globalObject, objTable);
  setupBasicFuncs(registry);
  setupDocumentFuncs(registry);
  setupFetchFuncs(registry);
}

