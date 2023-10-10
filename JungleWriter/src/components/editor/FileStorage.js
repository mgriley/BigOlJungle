import * as utils from './Utils.js'

/*
Some helper utils around the browser-native File Access APIs,
for Origin Private File System (OPFS).
*/

class BaseObj {
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
  constructor(nativeHandle, parentObj) {
    super(nativeHandle, parentObj);
  }

  toDumpJson() {
    return this.getName();
  }

  async getFile() {
    return await this.nativeHandle.getFile();
  }

  async writeContents(contents) {
    // Note: contents may be a string, Blob, File (which is a kind of Blob), etc.
    const writable = await this.nativeHandle.createWritable();
    await writable.write(contents);
    await writable.close();
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
  constructor(nativeHandle, parentObj) {
    super(nativeHandle, parentObj);
    this.children = {};
  }

  toDumpJson() {
    return {
      name: this.getName(),
      children: utils.mapDict(this.children, (key, child) => {
        return child.toDumpJson();
      }),
    }
  }

  dump() {
    console.log("Dumping dir: " + this.getName());
    console.log(utils.prettyJson(this.toDumpJson()));
  }

  getSortedChildren() {
    let keys = Object.keys(this.children);
    keys.sort();
    return keys.map((key) => { return this.children[key]; });
  }

  async createSubDir(name) {
    let childHandle = await this.nativeHandle.getDirectoryHandle(name, {create: true});
    let childObj = new DirObj(childHandle, this);
    this.children[childObj.getName()] = childObj;
    return childObj;
  }

  async createFile(name) {
    let childHandle = await this.nativeHandle.getFileHandle(name, {create: true});
    let childObj = new FileObj(childHandle, this);
    this.children[childObj.getName()] = childObj;
    return childObj;
  }

  hasChild(name) {
    return name in this.children;
  }

  genValidFileName(startingName) {
    // Note: startingName should not contain any slashes
    let ctr = 1;
    let nameInfo = getBaseAndExt(startingName);
    let name = startingName;
    while (this.hasChild(name)) {
      name = `${nameInfo.base}_${ctr++}.${nameInfo.ext}`;
    }
    return name;
  }

  async removeChild(name) {
    await this.nativeHandle.removeEntry(name);
  }

  async removeChildRecursive(name) {
    await this.nativeHandle.removeEntry(name, {recursive: true});
  }

  async findOrCreateDir(dirPath) {
    let parts = dirPath.split("/");
    let curDir = this;
    for (const part of parts) {
      let nextDir = curDir.children[part];
      if (!nextDir) {
        console.log("Creating subdir: " + part);
        nextDir = await curDir.createSubDir(part);
      }
      if (!nextDir.isDir()) {
        throw new Error("Unexpected: file at path .../" + part + " is not a dir.");
      }
      curDir = nextDir;
    }
    return curDir;
  }
};

export class FileStorage {

  constructor() {
    this.root = null;
  }

  async reload() {
    // Read OPFS into this class
    let nativeRoot = await navigator.storage.getDirectory();
    this.root = new DirObj(nativeRoot, null);
    let dirStack = [{dirObj: this.root}];
    while (dirStack.length > 0) {
      let stackItem = dirStack.pop();
      let dirObj = stackItem.dirObj;
      // console.log("Processing " + dirObj.getName() + ", " + dirObj.getKind());
      for await (const [key, handle] of dirObj.nativeHandle.entries()) {
        let childObj = null;
        if (handle.kind == 'file') {
          childObj = new FileObj(handle, dirObj);
        } else if (handle.kind == 'directory') {
          childObj = new DirObj(handle, dirObj);
        } else {
          throw new Error("Unknown file kind " + handle.kind);
        }
        dirObj.children[childObj.getName()] = childObj;
        if (childObj.isDir()) {
          dirStack.push({dirObj: childObj});
        }
      }
    }
  }

  dump() {
    if (this.root) {
      this.root.dump();
    } else {
      console.log("FS not loaded yet.");
    }
  }
}

