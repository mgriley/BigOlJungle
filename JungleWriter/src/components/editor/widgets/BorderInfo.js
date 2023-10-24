import { gApp, Node } from '../State.js'
import { extendMap, AsyncValue } from '../Utils.js'

export class BorderInfo {
  constructor() {
    this.width = 2;
    this.style = 'none';
    this.color = 'black';
  }

  writeToJson() {
    return {
      width: this.width,
      style: this.style,
      color: this.color
    }
  }

  readFromJson(obj) {
    this.width = obj.width;
    this.style = obj.style;
    this.color = obj.color;
  }

  getStyleObject() {
    return {
      'border': `${this.width}px ${this.style} ${this.color}`,
    }
  }
};

