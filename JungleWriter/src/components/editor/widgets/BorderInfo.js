import { gApp, Node } from '../State.js'
import { extendMap } from '../Utils.js'

export class BorderInfo {
  constructor() {
    this.width = 2;
    this.style = 'none';
    this.color = 'black';
    this.radius = 0;
  }

  writeToJson() {
    return {
      width: this.width,
      style: this.style,
      color: this.color,
      radius: this.radius,
    }
  }

  readFromJson(obj) {
    this.width = obj.width;
    this.style = obj.style;
    this.color = obj.color;
    this.radius = obj.radius;
  }

  getStyleObject() {
    return {
      'border': `${this.width}px ${this.style} ${this.color}`,
      'border-radius': `${this.radius}px`,
    }
  }
};

