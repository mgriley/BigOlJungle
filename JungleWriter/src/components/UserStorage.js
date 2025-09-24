import { prettyJson } from './Utils.js'

/*
For now just directly access localStorage directly.
*/
export class UserStorage {

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

  getKeys() {
    let keys = [];
    for (let i = 0; i < localStorage.length; ++i) {
      keys.push(localStorage.key(i));
    }
    return keys;
  }

  dumpAll() {
    let keys = this.getKeys();
    keys.sort();
    console.log(`User Storage (${keys.length} keys)`);
    for (const key of keys) {
      let valueObj = this.getItem(key);
      console.log(`${key}:\n${prettyJson(valueObj)}`);
    }
  }

  clearAll() {
    console.log("Clearing storage");
    let keys = this.getKeys();
    for (const key of keys) {
      this.removeItem(key);
    }
  }
};

