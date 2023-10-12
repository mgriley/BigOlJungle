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

    this.width = 400;
    this.height = 400;
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      srcName: this.srcName,
      altText: this.altText,
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.srcName = obj.srcName;
    this.altText = obj.altText;
    this.reloadSrcUrl();
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

  async asyncReloadSrcUrl() {
    await nextTick();
    console.log("Reloading srcUrl...");
    this.srcUrl = "Loading";
    let siteDir = gApp.site.siteDir;
    if (!siteDir) {
      return;
    }
    let fileObj = siteDir.findChild(this.srcName);
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
    let myStyle = {
      width: `${this.width}px`,
      height: `${this.height}px`,
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};

