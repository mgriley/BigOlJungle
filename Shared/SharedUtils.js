import { reactive, ref } from 'vue'

export function addElem(array, elem, index=null) {
  if (index !== null) {
    array.splice(index, 0, elem);
  } else {
    array.push(elem);
  }
}

export function removeElem(array, elem) {
  const index = array.indexOf(elem);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export function extendArray(array, arrB) {
  for (const elem of arrB) {
    array.push(elem);
  }
}

export function clearArray(array) {
  array.length = 0;
}

export function replaceArray(array, newValues) {
  array.splice(0, array.length, ...newValues);
}

export function extendMap(map, newEntries) {
  for (const key in newEntries) {
    map[key] = newEntries[key];
  }
}

// Takes dict {a:valA, b:valB, ...} and returns
// {a:mapFunc(a, valA), b:mapFunc(b, valB), ...}
export function mapDict(dict, mapFunc) {
  let newDict = {};
  for (const key in dict) {
    newDict[key] = mapFunc(key, dict[key]);
  }
  return newDict;
}

export function curTimeSecs() {
  return (new Date()).getTime() / 1000.0;
}

export function prettyJson(obj) {
  return JSON.stringify(obj, null, 2);
}

export function countToHumanStr(count) {
  if (count > 1000*1000*1000) {
    return Math.floor(count / (1000*1000*1000)) + "B";
  } else if (count > 1000*1000) {
    return Math.floor(count / (1000*1000)) + "M";
  } else if (count > 10*1000) {
    return Math.floor(count / (1000)) + "K";
  }
  return String(count);
}

export function deepCopyObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function valOr(val, defaultVal) {
  return typeof val !== 'undefined' ? val : defaultVal;
}

export function deepCopyArray(arr, startInc, endExc) {
  startInc = valOr(startInc, 0);
  endExc = valOr(endExc, arr.length);
  let res = [];
  for (let i = startInc; i < endExc; ++i) {
    res.push(deepCopyObject(arr[i]));
  }
  return res;
}

export function writeObjToJson(obj) {
  return deepCopyObject(obj);
}

export function readObjFromJson(obj) {
  return deepCopyObject(obj);
}

/**
 * See: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 *
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as 
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
export function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}

export function hashString(str) {
  return hashFnv32a(str);
}

export function hashObject(obj) {
  let str = JSON.stringify(obj);
  return hashString(str);
}

/*
export function hash64(str) {
    var h1 = hash32(str);  // returns 32 bit (as 8 byte hex string)
    return h1 + hash32(h1 + str);  // 64 bit (as 16 byte hex string)
}
*/

export function waitMillis(numMillis) {
  return new Promise(resolve => setTimeout(resolve, numMillis));
}

export function isValidUrl(urlString) {
  try {
    return Boolean(new URL(urlString));
  } catch (error) {
    return false;
  }
}

export function downloadTextFile(contents, filename) {
  // See: https://web.dev/patterns/files/save-a-file/
  const blob = new Blob([contents], { type: 'text/plain' });
  downloadBlobFile(blob, filename);
}

export function downloadBlobFile(blob, filename) {
  // See: https://web.dev/patterns/files/save-a-file/
  const blobURL = URL.createObjectURL(blob);
  // Create invisible link element and trigger
  const a = document.createElement('a');
  a.href = blobURL;
  a.download = filename;
  a.style.display = 'none';
  document.body.append(a);
  a.click();

  // Revoke the blob URL and remove the element.
  setTimeout(() => {
    URL.revokeObjectURL(blobURL);
    a.remove();
  }, 1000);
}

// Returns null on error.
export async function asyncFetchText(url, options) {
  let textStr = null;
  try {
    let response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Failed to get: ${url}. ${reponse.status} ${response.statusText}`);
    }
    textStr = await response.text();
  } catch (error) {
    console.error(`Fetch for "${url}" failed with error: `, error);
    return null;
  }
  return textStr;
}

export function fatalAssert(condition, message) {
  if (!condition) {
    throw Error('Assert failed: ' + (message || ''));
  }
};

export async function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
    console.log("Copied!");
  }).catch((error) => {
    console.error("Failed to copy", error);
  });
}

// Returns `error` on error, otherwise null
export function readFromJsonWithRollback(obj, jsonText) {
  let origState = obj.writeToJson();
  try {
    obj.readFromJson(jsonText, ...extraArgs);
  } catch (error) {
    console.error("Failed to read from json. Rolling back to original state.");
    obj.readFromJson(origState);
    return error;
  }
  return null;
}

export function safeParseJson(jsonStr) {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing json.", error);
    return null;
  }
}

// Ex. pluralStr(1, "day") -> "day", pluralStr(2, "day") -> "days"
function pluralStr(number, str) {
  if (number == 1) {
    return str;
  }
  return str + "s";
}

function quantityStr(number, unitStr) {
  return `${number} ${pluralStr(number, unitStr)}`
}

export function getTimeAgoStr(date, opts)  {
  opts = valOr(opts, {});
  let curDate = new Date();    
  let hoursDiff = (curDate.getTime() - date.getTime()) / (1000.0*60*60);
  hoursDiff = Math.floor(hoursDiff);
  let res = null;
  if (hoursDiff > 24) {
    let daysAgo = Math.floor(hoursDiff / 24.0);
    res = quantityStr(daysAgo, "day") + " ago";
  } else if (hoursDiff >= 1) {
    res = quantityStr(hoursDiff, "hr") + " ago";
  } else {
    // hoursDiff == 0
    if (valOr(opts.enableMins, false)) {
      let minsDiff = (curDate.getTime() - date.getTime()) / (1000.0*60);
      minsDiff = Math.floor(minsDiff);
      res = quantityStr(minsDiff, "min") + " ago";
    } else {
      res = "0 hrs ago";
    }
  }
  return res;
}

export function secsSinceDate(date) {
  let curDate = new Date();
  return (curDate - date) / (1000.0);
}

export function getRandInt(maxValExclusive) {
  return Math.floor(Math.random() * maxValExclusive);
}

export function trimText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}


export class IntervalTimer {
  constructor(targetFunc, intervalSecs, opts) {
    this.targetFunc = targetFunc;
    this.intervalSecs = intervalSecs;
    this.timer = null;

    opts = valOr(opts, {});
    this.onlyWhenVisible = valOr(opts.onlyWhenVisible, false);

    // Do not start the timer right away.
    //this._reset();
  }

  start() {
    this._reset();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  runNow() {
    this.targetFunc();
    this._reset();
  }

  _reset() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(() => {
      if (this.onlyWhenVisible && document.visibilityState !== 'visible') {
        return;
      }
      this.targetFunc();
    }, this.intervalSecs * 1000)
  }
}

/**
 * A class for managing a lock that prevents multiple async functions from running at the same time.
 * Use for UI buttons, for ex.
 */
export class AsyncLock {
  constructor() {
    this.isRunning = false;
  }

  async run(task) {
    if (this.isRunning) return; // Ignore if already running
    this.isRunning = true;
    try {
      await task(); // Run the async function
    } finally {
      this.isRunning = false; // Reset lock after execution
    }
  }
}

/**
 * A 2D vector class with basic vector operations
 */
export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector to this vector and return a new Vec2
   * @param {Vec2} other - The vector to add
   * @returns {Vec2} A new vector with the sum
   */
  add(other) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }

  /**
   * Multiply this vector by a scalar and return a new Vec2
   * @param {number} scalar - The scalar to multiply by
   * @returns {Vec2} A new vector with the scaled values
   */
  multiply(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar);
  }

  /**
   * Get the length (magnitude) of this vector
   * @returns {number} The length of the vector
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this vector and return a new Vec2 with length 1
   * @returns {Vec2} A new normalized vector, or (0,0) if the original vector has zero length
   */
  normalize() {
    const len = this.length();
    if (len === 0) {
      return new Vec2(0, 0);
    }
    return new Vec2(this.x / len, this.y / len);
  }

  /**
   * Create a copy of this vector
   * @returns {Vec2} A new vector with the same x and y values
   */
  clone() {
    return new Vec2(this.x, this.y);
  }
}

export class Options {
  constructor(optionsObj) {
    this.options = optionsObj || {};
  }

  get(key, defaultVal) {
    if (key in this.options) {
      return this.options[key];
    }
    return defaultVal;
  }
}

export class RectUtils {
  /**
   * Check if two rectangles overlap
   * @param {Object} rect1 - First rectangle with {x, y, w, h} properties
   * @param {Object} rect2 - Second rectangle with {x, y, w, h} properties
   * @returns {boolean} True if rectangles overlap, false otherwise
   */
  static doesOverlap(rect1, rect2) {
    return !(
      rect1.x > rect2.x + rect2.w ||
      rect1.x + rect1.w < rect2.x ||
      rect1.y > rect2.y + rect2.h ||
      rect1.y + rect1.h < rect2.y
    );
  }
}
