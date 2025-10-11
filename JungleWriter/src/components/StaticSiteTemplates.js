
export let StaticIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="icon" href="{{FAVICON_HREF}}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{SITE_DESCRIPTION}}">
  <title>{{SITE_TITLE}}</title>
  <link rel="stylesheet" href="styles.css">
  <!-- Site made with JungleWriter - https://www.junglewriter.com -->
</head>
<body>
  <div id="app">
    <main id="Main" style="{{MAIN_STYLE_STRING}}">
      <div class="AnchorDiv">
{{CONTENT}}
      </div>
    </main>
  </div>
</body>
</html>
`;

export let StaticStylesCss = `
`

function camelToKebab(str) {
  return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
}

export function stylesDictToInlineString(stylesDict) {
  /**
   * Given a dict like {"color": "red", "fontSize": "12px"},
   * make a string like 'color: red; font-size: 12px;'
   */
  let strings = [];
  for (let [key, value] of Object.entries(stylesDict)) {
    let kebabKey = camelToKebab(key);
    strings.push(`${kebabKey}: ${value};`);
  }
  if (strings.length === 0) {
    return null;
  }
  return strings.join(' ');
}

export function escapeHtml(text) {
  /**
   * Escape HTML special characters to ensure valid HTML
   */
  if (typeof text !== 'string') {
    return text;
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function applyIndent(text, indent) {
  /**
   * Apply indentation to each line of the given text
   */
  let indentStr = ' '.repeat(indent);
  return text.split('\n').map(line => indentStr + line).join('\n');
}

export function createElementString(tag, attrs = {}, styles = {}, content = '') {
  let stylesStr = stylesDictToInlineString(styles);
  let allAttrs = { ...attrs, style: stylesStr };
  let attrString = Object.entries(allAttrs)
    .filter(([key, value]) => value !== null && value !== undefined)
    .map(([key, value]) => ` ${key}="${escapeHtml(value)}"`)
    .join('');
  if (!content) {
    return `<${tag}${attrString}></${tag}>`;
  }
  return `<${tag}${attrString}>${content}</${tag}>`;
}
