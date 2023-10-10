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

