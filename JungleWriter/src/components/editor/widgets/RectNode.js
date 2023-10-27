import { reactive, ref, watchEffect, watch, nextTick } from 'vue'
import { gApp, Node } from '../State.js'
import { extendMap } from '../Utils.js'
import { BackgroundInfo } from './BackgroundInfo.js'
import { BorderInfo } from './BorderInfo.js'
import { FilterInfo } from './FilterInfo.js'

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
    this.filter = new FilterInfo();
    this.backdropFilter = new FilterInfo();
  }

  writeToJson() {
    let obj = super.writeToJson();
    extendMap(obj, {
      width: this.width,
      height: this.height,
      background: this.background.writeToJson(),
      border: this.border.writeToJson(),
      filter: this.filter.writeToJson(),
      backdropFilter: this.backdropFilter.writeToJson(),
    });
    return obj;
  }

  readFromJson(obj) {
    super.readFromJson(obj);
    this.width = obj.width;
    this.height = obj.height;
    this.background.readFromJson(obj.background);
    this.border.readFromJson(obj.border);
    if ('filter' in obj) {
      this.filter.readFromJson(obj.filter);
    }
    if ('backdropFilter' in obj) {
      this.backdropFilter.readFromJson(obj.backdropFilter);
    }
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      width: `${this.width}px`,
      height: `${this.height}px`,
      ...this.background.getStyleObject(),
      ...this.border.getStyleObject(),
      ...this.filter.getStyleObject('filter'),
      ...this.backdropFilter.getStyleObject('backdrop-filter'),
      opacity: 0.5,
    };
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};

