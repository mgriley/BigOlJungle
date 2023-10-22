import { reactive, ref, watchEffect, watch, nextTick } from 'vue'
import { gApp, Node } from '../State.js'
import { extendMap, AsyncValue } from '../Utils.js'

export class ImageNode extends Node {
  static sUiShortName = "I";

  constructor() {
    super();
    this.name = "Image";
    this.type = "ImageNode";
    this.allowsChildren = false;

    this.srcName = "IMG_8175.HEIC";
    this.altText = "Alt text goes here";

    // Derived
    this.srcUrl = null;

    this.preserveAspectRatio = true;
    this.width = 400;
    this.height = 400;
  }

  onCreate() {
    let node = this;
    function onChange() {
      node.reloadSrcUrl();
    }
    this.fileChangeHandle = gApp.fileStorage.onChangeEvt.addListener(onChange);
  }

  onDestroy() {
    gApp.fileStorage.onChangeEvt.removeListener(this.fileChangeHandle);
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      srcName: this.srcName,
      altText: this.altText,
      preserveAspectRatio: this.preserveAspectRatio,
      width: this.width,
      height: this.height,
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.srcName = obj.srcName;
    this.altText = obj.altText;
    this.preserveAspectRatio = obj.preserveAspectRatio;
    this.width = obj.width;
    this.height = obj.height;
  }

  getSrcUrl() {
    return this.srcUrl;
  }

  getSrcName() {
    return this.srcName;
  }

  setSrcName(newSrcName) {
    this.srcName = newSrcName;
    this.reloadSrcUrl();
  }

  getPreserveAspectRatio() {
    return this.preserveAspectRatio;
  }

  setPreserveAspectRatio(newVal) {
    // TODO - should really keep the current height when transitioning, but whatever
    this.preserveAspectRatio = newVal;
  }

  async asyncReloadSrcUrl() {
    await nextTick();
    console.log("Reloading srcUrl...");
    this.srcUrl = "Loading";
    let siteDir = gApp.site.siteDir;
    if (!siteDir) {
      return;
    }
    let fileObj = await siteDir.findChild(this.srcName);
    if (!fileObj) {
      this.srcUrl = "NotFound";
      return;
    }
    if (!fileObj.isFile()) {
      this.srcUrl = "Error";
      throw new Error("Found file is not file-kind. Unexpected.");
    }
    this.srcUrl = await fileObj.createObjectUrl();
    console.log("Reloaded srcUrl: " + this.srcUrl);
  }

  reloadSrcUrl() {
    // TODO - handle cancels better
    this.asyncReloadSrcUrl();
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {};
    if (this.preserveAspectRatio) {
      myStyle = {
        ...myStyle,
        width: `${this.width}px`,
        height: 'auto',
      };
    } else {
      myStyle = {
        ...myStyle,
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }

  getImgStyleObject() {
    let myStyle = {};
    return {
      ...myStyle
    };
  }
};

