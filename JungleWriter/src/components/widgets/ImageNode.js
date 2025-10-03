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

    this.srcName = "";
    this.altText = "Image of a...";

    // Derived
    this.srcUrl = null;

    this.preserveAspectRatio = true;
    this.width = 300;
    this.height = 300;
    this.posX = -150;
    this.posY = 0;
  }

  onCreate() {
    // TODO - this is a bit hacky
    /*
    let node = this;
    function onChange() {
      node.reloadSrcUrl();
    }
    this.fileChangeHandle = gApp.fileStorage.onChangeEvt.addListener(onChange);
    */
  }

  onDestroy() {
    // TODO - this is a bit hacky
    /*
    gApp.fileStorage.onChangeEvt.removeListener(this.fileChangeHandle);
    */
  }

  onEnter() {
    super.onEnter();
    this.reloadSrcUrl();

    this.fileChangeHandle = gApp.fileStorage.onChangeEvt.addListener((obj) => {
      if ((obj.type === 'delete' || obj.type === 'write-file')
        && obj.name === this.srcName) {
        this.reloadSrcUrl();
      }
    });
  }

  onExit() {
    super.onExit();
    if (this.srcUrl) {
      URL.revokeObjectURL(this.srcUrl);
    }
    if (this.fileChangeHandle) {
      gApp.fileStorage.onChangeEvt.removeListener(this.fileChangeHandle);
      this.fileChangeHandle = null;
    }
  }

  getAllowsChildren() {
    return false;
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
    if (!gApp.site || !gApp.site.siteDir) {
      console.log("No site or siteDir");
      return;
    }
    if (this.srcUrl) {
      URL.revokeObjectURL(this.srcUrl);
    }
    this.srcUrl = null;
    let siteDir = gApp.site.siteDir;
    let fileObj = await siteDir.findChild(this.srcName);
    if (!fileObj) {
      // Not found
      return;
    }
    if (!fileObj.isFile()) {
      throw new Error("The image src does not refer to a file.");
    }
    this.srcUrl = await fileObj.createObjectUrl();
    console.log("Reloaded srcUrl: " + this.srcUrl);
  }

  reloadSrcUrl() {
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

  _cloneSelf() {
    if (!this.parentNode) {
      throw new Error("Cannot clone the Root node");
    }
    let clone = gApp.site.createNode(ImageNode);
    clone.name = this.name;
    clone.posX = this.posX;
    clone.posY = this.posY;
    clone.altText = this.altText;
    clone.preserveAspectRatio = this.preserveAspectRatio;
    clone.width = this.width;
    clone.height = this.height;
    clone.srcName = this.srcName;
    
    return clone;
  }

  async generateStaticHtml(writer) {
    await writer.addFileWithName(this.srcName);

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

