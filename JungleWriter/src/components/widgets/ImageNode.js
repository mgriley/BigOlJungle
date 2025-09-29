import { reactive, ref, watchEffect, watch, nextTick } from 'vue'
import { gApp } from '../State.js'
import { Node } from '../Node.js'
import { extendMap, AsyncValue } from '../Utils.js'
import { createElementString } from '../StaticSiteTemplates.js'

export class ImageNode extends Node {
  static sUiShortName = "I";

  constructor(id) {
    super(id);
    this.name = "Image";
    this.type = "ImageNode";
    this.allowsChildren = false;

    this.srcName = "";
    this.altText = "Image of a...";

    // Derived
    this.srcUrl = null;

    this.preserveAspectRatio = true;
    this.width = 300;
    this.height = 300;
    this.posX = -150;
    this.posY = 0;

    this.linkUrl = "";
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
      linkUrl: this.linkUrl,
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
    this.linkUrl = obj.linkUrl;
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

  async generateStaticHtml(writer) {
    // Add the image file to the static site if it exists
    if (this.srcName && gApp.site.siteDir) {
      let fileObj = await gApp.site.siteDir.findChild(this.srcName);
      if (fileObj && fileObj.isFile()) {
        let file = await fileObj.getFile();
        writer.addBlobFile(this.srcName, file);
      }
    }

    let imgStyleObject = this.getImgStyleObject();
    let imgHtml = createElementString(
      'img', 
      {
        class: "",
        src: this.srcName,
        alt: this.altText
      }, 
      imgStyleObject
    );
    
    return createElementString(
      'div', 
      {class: "Widget ImageWidget"}, 
      this.getStyleObject(),
      imgHtml
    );
  }
};

