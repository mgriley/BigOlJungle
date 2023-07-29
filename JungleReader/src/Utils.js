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

const kNodeTypeNames = {
  [Node.ELEMENT_NODE]: "elem",
  [Node.ATTRIBUTE_NODE]: "attr",
  [Node.TEXT_NODE]: "text",
  [Node.CDATA_SECTION_NODE]: "cdata",
  [Node.PROCESSING_INSTRUCTION_NODE]: "proc_ins",
  [Node.COMMENT_NODE]: "comment",
  [Node.DOCUMENT_NODE]: "doc",
  [Node.DOCUMENT_TYPE_NODE]: "doc_type",
  [Node.DOCUMENT_FRAGMENT_NODE]: "doc_frag",
};

function isWhitespaceNode(node) {
  return node.nodeValue.trim().length == 0;
}

function parseNode(node, result) {
  let obj = {
    type: kNodeTypeNames[node.nodeType],
    value: node.nodeValue,
    name: node.nodeName,
    children: [],
    attrs: {}
  }
  for (let child of node.childNodes) {
    if (child.nodeType == Node.COMMENT_NODE ||
      (child.nodeType == Node.TEXT_NODE && isWhitespaceNode(child))) {
      continue;
    }
    let childObj = parseNode(child);
    obj.children.push(childObj);
  }
  if (node.attributes) {
    for (let attr of node.attributes) {
      obj.attrs[attr.nodeName] = attr.nodeValue;
    }
  }

  return obj;
}

// See:
// https://www.javascripttutorial.net/javascript-dom/
// https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Examples
// https://stackoverflow.com/questions/4200913/xml-to-javascript-object
//
// mimeType should be "text/html" or "text/xml"
export function parseXml(xml, mimeType) {
  let dom = (new DOMParser()).parseFromString(xml, mimeType);
  return parseNode(dom);
}

// Document Element to pretty string
export function prettifyElement(elem) {
  return elem.outerHTML;
}

// See:
// https://stackoverflow.com/questions/376373/pretty-printing-xml-with-javascript
// https://jsfiddle.net/fbn5j7ya/
export function formatXML(xml, tab = '\t', nl = '\n') {
  let formatted = '', indent = '';
  const nodes = xml.slice(1, -1).split(/>\s*</);
  if (nodes[0][0] == '?') formatted += '<' + nodes.shift() + '>' + nl;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node[0] == '/') indent = indent.slice(tab.length); // decrease indent
    formatted += indent + '<' + node + '>' + nl;
    if (node[0] != '/' && node[node.length - 1] != '/' && node.indexOf('</') == -1) indent += tab; // increase indent
  }
  return formatted;
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

export function getSiblingNum(jsNode) {
  if (!jsNode.parent) {
    return 0;
  }
  for (let i = 0; i < jsNode.parent.children.length; ++i) {
    if (jsNode.parent.children[i] == jsNode) {
      return i;
    }
  }
  throw new Error("Child not found");
}

export function tryGetSibling(jsNode, siblingNum) {
  if (!jsNode.parent) {
    return null;
  }
  if (!(0 <= siblingNum && siblingNum < jsNode.parent.children.length)) {
    return null;
  }
  return jsNode.parent.children[siblingNum];
}

export function fatalAssert(condition, message) {
  if (!condition) {
    throw Error('Assert failed: ' + (message || ''));
  }
};

