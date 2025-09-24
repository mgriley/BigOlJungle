import { gApp, Node } from '../State.js'
import { extendMap } from '../Utils.js'

export class BackgroundInfo {
  constructor() {
    this.type = 'solid';
    this.color = 'white';
    // TODO - impl gradient and img
  }

  writeToJson() {
    return {
      type: this.type,
      color: this.color,
    }
  }

  readFromJson(obj) {
    this.type = obj ? obj.type : 'solid';
    this.color = obj ? obj.color : 'white';
  }

  getStyleObject() {
    let obj = {};
    if (this.type == 'solid') {
      extendMap(obj, {
        'background-color': this.color,
      })
    }
    return obj;
  }
};

