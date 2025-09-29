
export let StaticIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- TODO - favicons -->
  <!--<link rel="icon" href="/favicon.svg" type="image/svg+xml">-->
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  return strings.join(' ');
}

export function createElementString(tag, attrs = {}, styles = {}, content = '') {
  let stylesStr = stylesDictToInlineString(styles);
  let allAttrs = { ...attrs, style: stylesStr };
  let attrString = Object.entries(allAttrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join('');
  return `<${tag}${attrString}>${content}</${tag}>`;
}
