import { reactive, ref } from 'vue'
import * as shared from 'Shared/SharedUtils.js'

export * from 'Shared/SharedUtils.js'
export * from './DragUtils.js'

class SerField {
  constructor(fieldName, writeFunc, readFunc, defaultValFunc) {
    this.fieldName = fieldName;
    this.writeFunc = writeFunc;
    this.readFunc = readFunc;
    this.defaultValFunc = defaultValFunc;
  }

  // TODO - add helper static methods
}

// TODO - not used right now. May use later. May clean things up.
class Serializer {
  constructor(fields) {
    this.fields = fields;
  }

  writeToJson(obj) {
    let jsonObj = {};
    for (const field of this.fields) {
      jsonObj[field.fieldName] = field.writeFunc(obj[field.fieldName]);
    }
    return jsonObj;
  }

  readFromJson(targetObj, jsonObj) {
    for (const field of this.fields) {
      if (field.fieldName in jsonObj) {
        field.readFunc(targetObj[field.fieldName], jsonObj[field.fieldName]);
      } else {
        targetObj[field.fieldName] = field.defaultValFunc();
      }
    }
  }
}

/*
class SampleClass {
  constructor() {
    this.border = new Border();

    this.serializer = new Serializer([
      SerField.basic('lol', null),
      SerField.list('border', [], () => {
        return new Post();
      }),
    ])
  }
}
*/

/*
Helper class for registering/unregistered for events
*/
export class EventSource {
  constructor() {
    this.idCtr = 1;
    this.listeners = [];
  }

  addListener(listenerFunc) {
    let handle = this.idCtr++;
    this.listeners.push({handle: handle, func: listenerFunc});
    return handle;
  }

  removeListener(handle) {
    for (let i = 0; i < this.listeners.length; ++i) {
      if (this.listeners[i].handle == handle) {
        this.listeners.splice(i, 1);
        break;
      }
    }
  }

  emit(...evtArgs) {
    let curListeners = [...this.listeners];
    for (const listener of curListeners) {
      listener.func(...evtArgs);
    }
  }
};

/*
Helper class for a value that is produced by a Promise
*/
export class AsyncValue {
  #isReady

  constructor(promise) {
    // Note: can call with no-args for a dummy AsyncValue
    this.promise = promise;
    this.value = null;
    this.error = null;
    this.#isReady = false;

    if (promise) {
      let asyncVal = this;
      promise.then((result) => {
        asyncVal.value = result;
        asyncVal.#isReady = true;
      }).catch((error) => {
        asyncVal.error = error;
        asyncVal.#isReady = true;
      });
    }
  }

  isReady() {
    return this.#isReady;
  }
}

export function removeItem(array, elem) {
  return shared.removeElem(array, elem);
}

export function readFromStorage(objToUpdate, userStorage, storageKey) {
  let storedState = userStorage.getItem(storageKey);
  if (storedState) {
    objToUpdate.readFromJson(storedState);
  }
}

export function writeToStorage(objToWrite, userStorage, storageKey) {
  userStorage.setItem(storageKey, objToWrite.writeToJson());
}

