import { extendMap } from '../Utils.js'
import { ColorInput } from './ColorInput.js'

export class BackgroundInfo {
  constructor() {
    this.type = 'solid';
    this.color = new ColorInput('#ffffff', 1.0);
    // TODO - impl gradient and img
  }

  writeToJson() {
    return {
      type: this.type,
      color: this.color.writeToJson(),
    }
  }

  readFromJson(obj) {
    this.type = obj ? obj.type : 'solid';
    if (obj && obj.color) {
      this.color.readFromJson(obj.color);
    } else {
      this.color = new ColorInput('#ffffff', 1.0);
    }
  }

  getStyleObject() {
    let obj = {};
    if (this.type == 'solid') {
      extendMap(obj, {
        'background-color': this.color.getColorValue(),
      })
    }
    return obj;
  }
};

