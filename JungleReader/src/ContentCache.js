import { prettyJson } from './Utils.js'

/*
For now just directly access localStorage directly.
*/
export class ContentCache {

  constructor() {
  }

  getItem(itemKey) {
    /*
    Returns null if not found
    */
    let obj = localStorage.getItem(itemKey);
    return obj !== null ? JSON.parse(obj) : null;
  }

  setItem(itemKey, itemValue) {
    let jsonStr = prettyJson(itemValue);
    localStorage.setItem(itemKey, jsonStr);
  }

  removeItem(itemKey) {
    localStorage.removeItem(itemKey);
  }
};

