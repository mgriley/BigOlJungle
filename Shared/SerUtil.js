import { ref, reactive } from 'vue'

/*
Serializer Utils
*/

function hasProp(obj, propName) {
  return typeof obj == 'object' && obj.hasOwnProperty(propName);
}

export function writeToJson(obj) {
  if (hasProp(obj, 'writeToJson')) {
    return obj.writeToJson();
  } else if (hasProp(obj, 'serFields')) {
    let data = {};
    for (const field of obj.serFields) {
      if (typeof field == 'string') {
        data[field] = writeToJson(obj[field]);
      } else {
        if (field.type == "ObjArray") {
          let arr = [];
          for (const elem of obj[field.name]) {
            arr.push(writeToJson(elem));
          }
          data[field.name] = arr;
        } else {
          throw new Error("Invalid serField: ", field);
        }
      }
    }
    return data;
  }
  return obj;
}

export function readFromJson(targetObj, data) {
  if (hasProp(targetObj, 'readFromJson')) {
    targetObj.readFromJson(data);
  } else if (hasProp(targetObj, 'serFields')) {
    for (const field of targetObj.serFields) {
      if (!hasProp(data, field)) {
        // Keep targetObj[field] as its default
        continue;
      }
      // console.log(`Reading field ${field} for obj `, targetObj);
      if (typeof field == 'string') {
        if (hasProp(targetObj[field], 'readFromJson') || hasProp(targetObj[field], 'serFields')) {
          // Complex object. Recurse
          readFromJson(targetObj[field], data[field]);
        } else {
          // Plain object
          targetObj[field] = data[field];
        }
      } else {
        if (field.type == 'ObjArray') {
          let arr = [];
          for (const elemData of data[field.name]) {
            let elem = data.elemCtor();
            readFromJson(elem, elemData);
            arr.push(elem);
          }
          targetObj[field] = arr;
        } else {
          throw new Error("Invalid serField: " + field);
        }
      }
    }
  } else {
    throw new Error("No way to readFromJson for the given obj");
  }
}

