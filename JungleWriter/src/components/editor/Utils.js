import { reactive, ref } from 'vue'
export * from 'Shared/SharedUtils.js'
export * from './DragUtils.js'

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
  return removeElem(array, elem);
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

