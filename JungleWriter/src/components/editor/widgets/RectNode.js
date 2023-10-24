import { reactive, ref, watchEffect, watch, nextTick } from 'vue'
import { gApp, Node } from '../State.js'
import { extendMap } from '../Utils.js'
import { BackgroundInfo } from './BackgroundInfo.js'
import { BorderInfo } from './BorderInfo.js'

export class RectNode extends Node {
  static sUiShortName = "R";

  constructor() {
    super();
    this.name = "Rect";
    this.type = "RectNode";
    this.allowsChildren = false;

    this.width = 400;
    this.height = 400;
    this.background = new BackgroundInfo();
    this.border = new BorderInfo();
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      width: this.width,
      height: this.height,
      background: this.background.writeToJson(),
      border: this.border.writeToJson(),
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.width = obj.width;
    this.height = obj.height;
    this.background.readFromJson(obj.background);
    this.border.readFromJson(obj.border);
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      width: `${this.width}px`,
      height: `${this.height}px`,
      ...this.background.getStyleObject(),
      ...this.border.getStyleObject(),
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};

