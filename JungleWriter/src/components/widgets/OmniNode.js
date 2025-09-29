import * as State from '../State.js'
import  { Node } from '../Node.js'
import { extendMap } from '../Utils.js'
import { BackgroundInfo } from './BackgroundInfo.js'
import { BorderInfo } from './BorderInfo.js'

export class OmniNode extends Node {
  static sUiShortName = "O";

  constructor(id) {
    super(id);
    this.name = "Omni";
    this.type = "OmniNode";

    this.width = 400;
    this.height = 400;
    this.background = new BackgroundInfo();
    this.border = new BorderInfo();

    this.fontFamily = null;
    this.fontSize = 36;
    this.color = "white";
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      width: this.width,
      height: this.height,
      background: this.background.writeToJson(),
      border: this.border.writeToJson(),

      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      color: this.color,
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.width = obj.width || this.width;
    this.height = obj.height || this.height;
    if (obj.background) {
      this.background.readFromJson(obj.background);
    }
    if (obj.border) {
      this.border.readFromJson(obj.border);
    }

    this.fontFamily = obj.fontFamily || this.fontFamily;
    this.fontSize = obj.fontSize || this.fontSize;
    this.color = obj.color || this.color;
  }

  getAllowsChildren() {
    return false;
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      width: `${this.width}px`,
      height: `${this.height}px`,
      ...this.background.getStyleObject(),
      ...this.border.getStyleObject(),
      //...this.filter.getStyleObject('filter'),
      //...this.backdropFilter.getStyleObject('backdrop-filter'),
    };
    if (this.fontSize) {
      myStyle.fontSize = this.fontSize;
    }
    if (this.fontFamily) {
      myStyle.fontFamily = this.fontFamily;
    }
    if (this.color) {
      myStyle.color = this.color;
    }
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};
