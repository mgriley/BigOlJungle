import { gApp, Node } from '../State.js'
import { extendMap, writeObjToJson, readObjFromJson } from '../Utils.js'

// TODO - left off here
/*
TODO - left off here.
Want:
-Add item
-Remove item
-little editor
*/

export class FilterInfo {
  constructor() {
    this.enabled = false;
    this.filters = [];
  }

  writeToJson() {
    return {
      enabled: this.enabled,
      filters: this.filters.map((elem) => {
        return writeObjToJson(elem);
      })
    }
  }

  readFromJson(obj) {
    this.enabled = obj.enabled;
    this.filters = obj.filters.map((elem) => {
      return readObjFromJson(elem);
    });
  }

  getStyleObject() {
    let obj = {};
    if (this.enabled) {
      extendMap(obj, {
      });
    }
    return obj;
  }
};

