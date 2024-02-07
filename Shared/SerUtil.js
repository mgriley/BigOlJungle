import { ref, reactive } from 'vue'

/*
Serializer Utils
*/

function hasProp(obj, propName) {
  return typeof obj == 'object' && obj.hasOwnProperty(propName);
}

/*
let kTypeMap = {
  'Date': {
    writeToJson: (obj) => {
      return obj.toJSON();
    },
    createFromJson: (data) => {
      return new Date(data);
    }
  }
}
*/

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
        } else if (field.type == "Date") {
          data[field.name] = obj[field.name].toJSON();
        } else {
          throw new Error("Invalid serField: ", field);
        }
      }
    }
    return data;
  } else {
    /*
    if (obj.constructor.name in kTypeMap) {
      console.log(`Using custom writer for ${obj.constructor.name}`);
      return kTypeMap[typeof obj].writeToJson();
    } else {
      return obj;
    }
    */
    return obj;
  }
}

export function readFromJson(targetObj, data) {
  if (hasProp(targetObj, 'readFromJson')) {
    targetObj.readFromJson(data);
  } else if (hasProp(targetObj, 'serFields')) {
    for (const field of targetObj.serFields) {
      // console.log(`Reading field ${field} for obj `, targetObj);
      if (typeof field == 'string') {
        // Simple serField item (ex. 'title')
        if (!hasProp(data, field)) {
          // The targetObj wants a field that's not in the data. Keep the default.
          continue;
        }
        if (hasProp(targetObj[field], 'readFromJson') || hasProp(targetObj[field], 'serFields')) {
          // Complex object. Recurse
          // console.log("Recursing");
          readFromJson(targetObj[field], data[field]);
        } else {
          // Plain object
          // console.log("Plain obj");
          targetObj[field] = data[field];
        }
      } else {
        // Complex serField item (ex. {name: 'posts', type: 'ObjArray', elemCtor: Post})
        if (!hasProp(data, field.name)) {
          // The targetObj wants a field that's not in the data. Keep the default.
          continue;
        }
        if (field.type == 'ObjArray') {
          let arr = [];
          // console.log(`Reading ObjArray ${field.name}: `, data[field.name]);
          for (const elemData of data[field.name]) {
            let elem = field.elemCtor();
            readFromJson(elem, elemData);
            arr.push(elem);
          }
          targetObj[field.name] = arr;
        } else if (field.type == 'Date') {
          targetObj[field.name] = new Date(data[field.name]);
        } else {
          throw new Error("Invalid serField: " + field);
        }
      }
    }
  } else {
    throw new Error("No way to readFromJson for the given obj");
  }
}

