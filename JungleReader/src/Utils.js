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

function copyOptions(options) {
  return options.map((option) => {
    return {
      key: option.key,
      value: option.value,
    }
  })
}

export function optionsToJson(options) {
  return copyOptions(options);
}

export function jsonToOptions(json) {
  return copyOptions(json);
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

export function cleanUrl(link) {
  // Att https if no scheme was given
  return (link.indexOf('://') === -1) ? 'https://' + link : link;
}

/*
See: https://stackoverflow.com/questions/4200913/xml-to-javascript-object
The following function parses XML and returns a JavaScript object with a scheme that corresponds to the XML.
XML siblings w/ the same name are collapsed into arrays.
nodes with names that can be found in the arrayTags parameter (array of tag name strings) always yield arrays
even in case of only one tag occurrence. arrayTags can be omitted.
Text nodes with only spaces are discarded.

mimeType should be "text/html" or "text/xml"
*/
export function parseXml(xml, mimeType, arrayTags) {
    let dom = (new DOMParser()).parseFromString(xml, mimeType);

    function parseNode(xmlNode, result) {
        if (xmlNode.nodeName == "#text") {
            let v = xmlNode.nodeValue;
            if (v.trim()) result['#text'] = v;
            return;
        }

        let jsonNode = {},
            existing = result[xmlNode.nodeName];
        if (existing) {
            if (!Array.isArray(existing)) result[xmlNode.nodeName] = [existing, jsonNode];
            else result[xmlNode.nodeName].push(jsonNode);
        }
        else {
            if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1) result[xmlNode.nodeName] = [jsonNode];
            else result[xmlNode.nodeName] = jsonNode;
        }

        if (xmlNode.attributes) for (let attribute of xmlNode.attributes) jsonNode[attribute.nodeName] = attribute.nodeValue;

        for (let node of xmlNode.childNodes) parseNode(node, jsonNode);
    }

    let result = {};
    for (let node of dom.childNodes) parseNode(node, result);

    return result;
}

