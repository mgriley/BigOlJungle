import { reactive, ref } from 'vue'
export * from 'Shared/SharedUtils.js'
export * from './DragUtils.js'

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

