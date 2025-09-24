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

export let kFilterValueInfo = [
  {
    name: 'blur',
    values: [
      {
        name: 'amt',
        type: 'px'
      }
    ],
  },
  {
    name: 'brightness',
    values: [
      {
        name: 'amt',
        type: 'percent',
      }
    ]
  },
  {
    name: 'contrast',
    values: [
      {
        name: 'amt',
        type: 'percent',
      }
    ]
  },
  {
    name: 'drop-shadow',
    values: [
      {
        name: 'offset-x',
        type: 'px'
      },
      {
        name: 'offset-y',
        type: 'px'
      },
      {
        name: 'blur-radius',
        type: 'px',
      },
      {
        name: 'color',
        type: 'color',
      }
    ]
  },
  {
    name: 'grayscale',
    values: [
      {
        name: 'amt',
        type: 'percent',
      }
    ]
  },
  {
    name: 'hue-rotate',
    values: [
      {
        name: 'amt',
        type: 'angle'
      }
    ]
  },
  {
    name: 'invert',
    values: [
      {
        name: 'amt',
        type: 'percent'
      }
    ]
  },
  {
    name: 'opacity',
    values: [
      {
        name: 'amt',
        type: 'percent',
      }
    ]
  },
  {
    name: 'saturate',
    values: [
      {
        name: 'amt',
        type: 'percent',
      }
    ]
  },
  {
    name: 'sepia',
    values: [
      {
        name: 'amt',
        type: 'percent'
      }
    ]
  }
];

export function findFilterDescWithName(name) {
  for (const elem of kFilterValueInfo) {
    if (elem.name == name) {
      return elem;
    }
  }
  throw new Error("Filter not found! " + name);
}

function valueToStr(valueDesc, value) {
  if (valueDesc.type == 'percent') {
    return `${value}%`;
  } else if (valueDesc.type == 'px') {
    return `${value}px`;
  } else if (valueDesc.type == 'color') {
    return `${value}`;
  } else if (valueDesc.type == 'angle') {
    return `${value}deg`;
  } else {
    throw new Error("Invalid value type: " + valueDesc.type);
  }
}

function getDefaultValue(valueDesc) {
  if (valueDesc.type == 'percent') {
    return 100;
  } else if (valueDesc.type == 'px') {
    return 4;
  } else if (valueDesc.type == 'color') {
    return 'black';
  } else if (valueDesc.type == 'angle') {
    return 0;
  } else {
    throw new Error("Invalid value type: " + valueDesc.type);
  }
}

class GenericValue {
  constructor(desc) {
    this.enabled = true;
    this.changeDesc(desc);
  }

  writeToJson() {
    return {
      enabled: this.enabled,
      desc: writeObjToJson(this.desc),
      values: writeObjToJson(this.values),
    }
  }

  readFromJson(obj) {
    this.enabled = readObjFromJson(obj.enabled);
    this.desc = readObjFromJson(obj.desc);
    this.values = readObjFromJson(obj.values);
  }

  changeDesc(desc) {
    this.desc = desc;
    if (this.desc) {
      this.values = this.desc.values.map((elem) => {
        return getDefaultValue(elem);
      });
    } else {
      this.values = [];
    }
  }

  toCss() {
    if (!this.enabled) {
      return '';
    }
    let valueList = [];
    for (let i = 0; i < this.desc.values.length; ++i) {
      valueList.push(valueToStr(this.desc.values[i], this.values[i]));
    }
    let valuesStr = valueList.join(' ');
    return `${this.desc.name}(${valuesStr})`;
  }
};

export class FilterInfo {
  constructor() {
    this.enabled = false;
    this.filters = [];
  }

  writeToJson() {
    return {
      enabled: this.enabled,
      filters: this.filters.map((elem) => {
        return elem.writeToJson();
      })
    }
  }

  readFromJson(obj) {
    this.enabled = obj.enabled;
    this.filters = obj.filters.map((elem) => {
      let value = new GenericValue(null);
      value.readFromJson(elem);
      return value;
    });
  }

  addFilter(type) {
    let desc = findFilterDescWithName(type);
    if (!desc) {
      throw new Error("The given filter type is invalid: " + type);
    }
    let newValue = new GenericValue(desc);
    this.filters.push(newValue);
    return newValue;
  }

  getStyleObject(fieldName) {
    let obj = {};
    if (this.enabled) {
      obj[fieldName] = this.filters.map((elem) => {
        return elem.toCss();
      }).join(' ');
    }
    return obj;
  }
};

