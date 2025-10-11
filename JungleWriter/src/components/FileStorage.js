
import * as utils from './Utils.js'
import JSZip from 'jszip'

/*
Writing files to OPFS (Origin Private File System) is not fully supported yet, so there
is some hackery here.
- On Chrome and Firefox, you can use the async createWritable() method directly on the main thread.
-- This works great.
- On Safari, the only way to write to OPFS files is to do so synchronously
through a web-worker. No way to do it on the main thread. So we use this class to manage stuff.
*/
class SafariFileWorker {
  constructor() {
    this._worker = null;
    this._workerPromises = new Map();
    this._nextWorkerId = 1;
  }

  static getInstance() {
    if (!SafariFileWorker._instance) {
      SafariFileWorker._instance = new SafariFileWorker();
    }
    return SafariFileWorker._instance;
  }

  async writeWithWorker(fileHandle, contents) {
    // Convert contents to transferable format
    let data;
    if (typeof contents === 'string') {
      data = contents;
    } else if (contents instanceof ArrayBuffer) {
      data = new Uint8Array(contents);
    } else if (contents instanceof Blob || contents instanceof File) {
      // Convert Blob/File to ArrayBuffer first
      const arrayBuffer = await contents.arrayBuffer();
      data = new Uint8Array(arrayBuffer);
    } else {
      data = contents;
    }

    return new Promise((resolve, reject) => {
      // Create worker if it doesn't exist
      if (!this._worker) {
        console.log("Creating Safari file worker");
        this._worker = new Worker(new URL('../workers/fileWriter.js', import.meta.url));
        this._worker.onmessage = (e) => {
          const { id, success, error } = e.data;
          const promise = this._workerPromises.get(id);
          if (promise) {
            this._workerPromises.delete(id);
            if (success) {
              promise.resolve();
            } else {
              promise.reject(new Error(error));
            }
          }
        };
      }

      const workerId = this._nextWorkerId++;
      this._workerPromises.set(workerId, { resolve, reject });

      // Send work to the worker
      this._worker.postMessage({
        id: workerId,
        fileHandle: fileHandle,
        data: data
      });
    });
  }

  cleanup() {
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
      this._workerPromises.clear();
    }
  }
}

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

  async dumpToString(indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = `${spaces}📄 ${this.getName()}`;
    
    // Try to determine if this is a text file and include contents
    const name = this.getName().toLowerCase();
    const textExtensions = ['.txt', '.json', '.js', '.vue', '.html', '.css', '.md', '.xml', '.csv'];
    const isTextFile = textExtensions.some(ext => name.endsWith(ext));
    
    if (isTextFile) {
      try {
        const content = await this.readText();
        const lines = content.split('\n');
        result += ` (${lines.length} lines)\n`;
        result += `${spaces}  Content:\n`;
        lines.forEach((line, index) => {
          result += `${spaces}    ${index + 1}: ${line}\n`;
        });
      } catch (error) {
        result += ` (error reading: ${error.message})\n`;
      }
    } else {
      result += '\n';
    }
    
    return result;
  }

  emitChangeEvt(obj) {
    this.emitter.emitChangeEvt(obj);
  }

  async getFile() {
    return await this.nativeHandle.getFile();
  }

  async createObjectUrl() {
    // Note - this must be released with URL.revokeObjectURL when no longer needed
    // Also note - this must be called each time the file changes, since it is based
    // on a snapshot of the file at the time of the call.
    let file = await this.getFile();
    return URL.createObjectURL(file);
  }

  async writeContents(contents) {
    // Note: contents may be a string, Blob, File (which is a kind of Blob), etc.
    
    // Check if createWritable is supported (Chrome, Firefox)
    if (this.nativeHandle.createWritable) {
      const writable = await this.nativeHandle.createWritable();
      await writable.write(contents);
      await writable.close();
    } 
    // Fallback to using the Safari worker method if createWritable is not supported
    else {
      const safariWorker = SafariFileWorker.getInstance();
      await safariWorker.writeWithWorker(this.nativeHandle, contents);
    }
    
    this.emitChangeEvt({type: 'write-file', name: this.getName()});
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

  async dumpToString(indent = 0) {
    const spaces = '  '.repeat(indent);
    let result = `${spaces}📁 ${this.getName()}/\n`;
    
    const children = await this.getChildren();
    const sortedKeys = Object.keys(children).sort();
    
    for (const key of sortedKeys) {
      const child = children[key];
      result += await child.dumpToString(indent + 1);
    }
    
    return result;
  }

  async dump() {
    console.log("Dumping file storage:");
    const dumpString = await this.dumpToString();
    console.log(dumpString);
  }

  emitChangeEvt(obj) {
    this.emitter.emitChangeEvt(obj);
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
    this.emitChangeEvt({name: childObj.getName(), type: 'create-dir'});
    return childObj;
  }

  async createFile(name) {
    let childHandle = await this.nativeHandle.getFileHandle(name, {create: true});
    let childObj = new FileObj(childHandle, this, this.emitter);
    this.emitChangeEvt({name: childObj.getName(), type: 'create-file'});
    return childObj;
  }

  async writeTextFile(name, text) {
    let file = await this.findChild(name);
    if (!file) {
      file = await this.createFile(name);
    }
    if (!file.isFile()) {
      throw new Error("File at path .../" + name + " is not a file-kind.");
    }
    await file.writeContents(text);
    return file;
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
    return curDir;
  }

  async removeChild(name) {
    await this.nativeHandle.removeEntry(name);
    this.emitChangeEvt({name: name, type: 'delete'});
  }

  async removeChildRecursive(name) {
    await this.nativeHandle.removeEntry(name, {recursive: true});
    // TODO - probs want to recursively call removeChild ourselves here so
    // we can emit delete events for each child.
    this.emitChangeEvt({name: name, type: 'delete' });
  }

  async exportToZip() {
    const zip = new JSZip();
    await this._addToZip(zip, '');
    return await zip.generateAsync({type: 'blob'});
  }

  async _addToZip(zip, basePath) {
    const children = await this.getChildren();
    
    for (const [name, child] of Object.entries(children)) {
      const childPath = basePath ? `${basePath}/${name}` : name;
      
      if (child.isFile()) {
        try {
          const file = await child.getFile();
          zip.file(childPath, file);
        } catch (error) {
          console.warn(`Failed to add file ${childPath} to zip:`, error);
        }
      } else if (child.isDir()) {
        await child._addToZip(zip, childPath);
      }
    }
  }

  async copyToDirectory(targetDir) {
    /**
     * Recursively copy this directory and all its contents to the target directory
     */
    const children = await this.getChildren();
    
    for (const [name, child] of Object.entries(children)) {
      if (child.isFile()) {
        // Copy file
        const fileContents = await child.getFile();
        const newFile = await targetDir.createFile(name);
        await newFile.writeContents(fileContents);
      } else if (child.isDir()) {
        // Create subdirectory and recursively copy
        const newSubDir = await targetDir.createSubDir(name);
        await child.copyToDirectory(newSubDir);
      }
    }
  }

  async importZip(zipBlob) {
    try {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(zipBlob);
      
      // Process each file in the zip
      for (const [relativePath, zipEntry] of Object.entries(zipContents.files)) {
        if (zipEntry.dir) {
          // Create directory
          await this.findOrCreateDir(relativePath);
        } else {
          // Create file
          const pathParts = relativePath.split('/');
          const fileName = pathParts.pop();
          const dirPath = pathParts.join('/');
          
          let targetDir = this;
          if (dirPath) {
            targetDir = await this.findOrCreateDir(dirPath);
          }
          
          // Get file content as blob
          const fileBlob = await zipEntry.async('blob');
          
          // Create the file and write contents
          const fileObj = await targetDir.createFile(fileName);
          await fileObj.writeContents(fileBlob);
        }
      }
      console.log('Zip imported successfully');
    } catch (error) {
      console.error('Failed to import zip:', error);
      throw error;
    }
  }
};

export class FileStorage {

  constructor() {
    this.root = null;
    this.onChangeEvt = new utils.EventSource();
  }

  cleanup() {
    // Clean up the Safari worker when FileStorage is destroyed
    const safariWorker = SafariFileWorker.getInstance();
    safariWorker.cleanup();
  }

  // Must finish before calling other FileStorage functions
  setRoot(rootDirHandle) {
    this.root = new DirObj(rootDirHandle, null, this);
  }

  emitChangeEvt(obj) {
    console.log("Emitting file change event: ", obj);
    this.onChangeEvt.emit(obj);
  }

  async dump() {
    if (this.root) {
      await this.root.dump();
    } else {
      console.log("FileStorage not initialized yet.");
    }
  }
}

