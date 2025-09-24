
import * as utils from './Utils.js'

/*
Some helper utils around the browser-native File Access APIs,
for Origin Private File System (OPFS).
*/

class BaseObj {
  // TODO: should probably remove parentObj and just have this be a nativeHandle wrapper
  // Note: parentObj is null for the root dir
  constructor(nativeHandle, parentObj) {
    this.nativeHandle = nativeHandle;
    this.parentObj = parentObj;
  }

  getName() {
    return this.nativeHandle.name;
  }

  getKind() {
    return this.nativeHandle.kind;
  }

  isDir() {
    return this.nativeHandle.kind == 'directory';
  }

  isFile() {
    return this.nativeHandle.kind == 'file';
  }

  getParent() {
    return this.parentObj;
  }

  remove() {
    if (!this.parentObj) {
      throw new Error("Cannot delete root dir");
    }
    this.parentObj.removeChild(this.getName());
  }
}

class FileObj extends BaseObj {
  constructor(nativeHandle, parentObj, emitter) {
    super(nativeHandle, parentObj);
    this.emitter = emitter;
  }

  toDumpJson() {
    return this.getName();
  }

  emitChangeEvt() {
    this.emitter.emitChangeEvt();
  }

  async getFile() {
    return await this.nativeHandle.getFile();
  }

  async createObjectUrl() {
    // Note: should release/revoke at an appropriate time, perhaps? Ignore for now.
    let file = await this.getFile();
    return URL.createObjectURL(file);
  }

  async writeContents(contents) {
    // Note: contents may be a string, Blob, File (which is a kind of Blob), etc.
    const writable = await this.nativeHandle.createWritable();
    await writable.write(contents);
    await writable.close();
    this.emitChangeEvt();
  }

  async readText() {
    let file = await this.nativeHandle.getFile();
    return await file.text();
  }
};

function getBaseAndExt(fileName) {
  let dotIndex = fileName.lastIndexOf(".");
  let baseName = null;
  let extName = null;
  if (dotIndex !== -1) {
    baseName = fileName.slice(0, dotIndex);
    extName = fileName.slice(dotIndex + 1);
  } else {
    baseName = fileName;
    extName = "";
  }
  return {base: baseName, ext: extName}
}

class DirObj extends BaseObj {
  constructor(nativeHandle, parentObj, emitter) {
    super(nativeHandle, parentObj);
    this.emitter = emitter;
  }

  async toDumpJson() {
    let children = await this.getChildren();
    let childJson = {};
    for (const [key, child] of Object.entries(children)) {
      childJson[key] = await child.toDumpJson();
    }
    return {
      name: this.getName(),
      children: childJson,
    }
  }

  async dump() {
    console.log("Dumping dir: " + this.getName());
    let dumpJson = await this.toDumpJson();
    console.log(utils.prettyJson(dumpJson));
  }

  emitChangeEvt() {
    this.emitter.emitChangeEvt();
  }

  /*
  Returns {name: BaseObj(),...}
  */
  async getChildren() {
    let children = {};
    for await (const [key, handle] of this.nativeHandle.entries()) {
      let childObj = null;
      if (handle.kind == 'file') {
        childObj = new FileObj(handle, this, this.emitter);
      } else if (handle.kind == 'directory') {
        childObj = new DirObj(handle, this, this.emitter);
      } else {
        throw new Error("Unknown file kind " + handle.kind);
      }
      children[childObj.getName()] = childObj;
    }
    return children;
  }

  /*
  Returns {name: {obj: FileObj, children: {...}},...}
  */
  async getChildrenRecursive() {
    let rootObj = {obj: this, children: {}};
    let dirStack = [rootObj];
    while (dirStack.length > 0) {
      let stackItem = dirStack.pop();
      // console.log("Processing " + dirObj.getName() + ", " + dirObj.getKind());
      let children = await obj.getChildren();
      for (const [key, childObj] of children) {
        stackItem.children[key] = {obj: childObj, children: {}};
        if (childObj.isDir()) {
          dirStack.push(childObj);
        }
      }
    }
    rootObj.children;
  }

  async getSortedChildren() {
    let children = await this.getChildren();
    let keys = Object.keys(children);
    keys.sort();
    return keys.map((key) => { return children[key]; });
  }

  async createSubDir(name) {
    let childHandle = await this.nativeHandle.getDirectoryHandle(name, {create: true});
    let childObj = new DirObj(childHandle, this, this.emitter);
    this.emitChangeEvt();
    return childObj;
  }

  async createFile(name) {
    let childHandle = await this.nativeHandle.getFileHandle(name, {create: true});
    let childObj = new FileObj(childHandle, this, this.emitter);
    this.emitChangeEvt();
    return childObj;
  }

  async genValidFileName(startingName) {
    // Note: startingName should not contain any slashes
    let children = await this.getChildren();
    let ctr = 1;
    let nameInfo = getBaseAndExt(startingName);
    let name = startingName;
    while (name in children) {
      name = `${nameInfo.base}_${ctr++}.${nameInfo.ext}`;
    }
    return name;
  }

  async hasChild(name) {
    let children = await this.getChildren();
    return name in children;
  }

  async findChild(fileName) {
    let children = await this.getChildren();
    if (!(fileName in children)) {
      return null;
    }
    return children[fileName];
  }

  // fileName can be a path with slashes here
  async findChildRecursive(fileName) {
    let parts = fileName.split("/");
    let curFile = this;
    for (const part of parts) {
      if (!curFile.isDir()) {
        throw new Error("Unexpected file on dir path: " + fileName);
      }
      curFile = await curFile.findChild(part);
      if (!curFile) {
        // File not found
        return null;
      }
    }
    return curFile;
  }

  async findOrCreateDir(dirPath) {
    let parts = dirPath.split("/");
    let curDir = this;
    let didCreateDir = false;
    for (const part of parts) {
      let nextDir = await curDir.findChild(part);
      if (!nextDir) {
        console.log("Creating subdir: " + part);
        nextDir = await curDir.createSubDir(part);
        didCreateDir = true;
      }
      if (!nextDir.isDir()) {
        throw new Error("Unexpected: file at path .../" + part + " is not a dir.");
      }
      curDir = nextDir;
    }
    if (didCreateDir) {
      this.emitChangeEvt();
    }
    return curDir;
  }

  async removeChild(name) {
    await this.nativeHandle.removeEntry(name);
    this.emitChangeEvt();
  }

  async removeChildRecursive(name) {
    await this.nativeHandle.removeEntry(name, {recursive: true});
    this.emitChangeEvt();
  }
};

export class FileStorage {

  constructor() {
    this.root = null;
    this.onChangeEvt = new utils.EventSource();
  }

  // Must finish before calling other FileStorage functions
  setRoot(rootDirHandle) {
    this.root = new DirObj(rootDirHandle, null, this);
  }

  emitChangeEvt() {
    this.onChangeEvt.emit();
  }

  async dump() {
    await this.root.dump();
  }
}

