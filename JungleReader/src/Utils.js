import { reactive, ref } from 'vue'
export * from 'Shared/SharedUtils.js'

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

export function cleanUrl(link) {
  // Add https if no scheme was given
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
export function formatXML(xml, tab = '  ', nl = '\n') {
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

// Used for web-request whitelisting
export function isSameHost(urlA, urlB) {
  return urlA.host === urlB.host;
}

/*
Note: this only validates that the `host` part of the `URL` objects match.
`host` is domainname:port, like "www.mysite.com", or, if has a specified port, "www.mysite.com:123".
*/
export function isDomainInWhitelist(urlString, allowedUrls) {
    let candidateUrl = new URL(urlString);
    for (const allowedUrlStr of allowedUrls) {
      let allowedUrl = new URL(allowedUrlStr);
      if (isSameHost(candidateUrl, allowedUrl)) {
        return true;
      }
    }
    return false;
}

