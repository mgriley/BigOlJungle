import { gApp, Node } from '../State.js'
import { extendMap } from '../Utils.js'

export class ImageNode extends Node {
  static sUiShortName = "I";

  constructor() {
    super();
    this.name = "Image";
    this.type = "ImageNode";
    this.allowsChildren = false;

    this.srcName = "IMG_8175.HEIC";
    this.altText = "Alt text goes here";
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
  }

  getSrcUrl() {
    // TODO - left off here
    // TODO - impl getSiteDir
    let siteDir = gApp.getSiteDir();
    if (!siteDir) {
      return "Loading";
    }
    // TODO - impl findChild
    let fileObj = siteDir.findChild(this.srcName);
    if (!fileObj) {
      return "NotFound";
    }
    if (!fileObj.isFile()) {
      throw new Error("Found file is not file-kind. Unexpected.");
    }
    return fileObj.createObjectUrl();
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};

