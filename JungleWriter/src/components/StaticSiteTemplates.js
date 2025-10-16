
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
      <div id="CanvasArea">
        <div class="AnchorDiv">
  {{CONTENT}}
        </div>
      </div>
    </main>
  </div>
  <script src="interactive.js"></script>
</body>
</html>
`;

export let StaticInteractiveJs = `
// Interactive drag functionality for JungleWriter sites.
// Allows clicking+dragging the canvas to scroll around.
// Also handles mouse wheel scrolling and touch events for mobile.
(function() {
  'use strict';
  
  // Track drag state
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };
  let scrollStart = { x: 0, y: 0 };
  
  // Track pinch-to-zoom state
  let initialDistance = 0;
  let scale = 1;
  let startScale = 1;
  
  // Get current translate values from CSS variables
  function getCurrentTranslate() {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return { x: 0, y: 0 };
    
    const style = getComputedStyle(mainElement);
    const translateX = parseFloat(style.getPropertyValue('--translateX')) || 0;
    const translateY = parseFloat(style.getPropertyValue('--translateY')) || 0;
    
    return { x: translateX, y: translateY };
  }
  
  // Calculate distance between two touch points
  function getDistance(touches) {
    const [a, b] = touches;
    const dx = b.clientX - a.clientX;
    const dy = b.clientY - a.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // Set translate values as CSS variables
  function setTranslate(x, y) {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return;
    
    mainElement.style.setProperty('--translateX', x + 'px');
    mainElement.style.setProperty('--translateY', y + 'px');
  }
  
  // Set scale value
  function setScale(newScale) {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return;
    
    scale = newScale;
    mainElement.style.setProperty('--canvas-scale', scale);
  }
  
  function onPointerDown(evt) {
    // Start scroll drag
    isDragging = true;
    dragStart = { x: evt.clientX, y: evt.clientY };
    scrollStart = getCurrentTranslate();
    // Set cursor to grabbing
    const mainElement = document.getElementById('Main');
    if (mainElement) {
      mainElement.style.cursor = 'grabbing';
    }
    evt.preventDefault();
  }
  
  function onPointerMove(evt) {
    if (isDragging) {
      const deltaX = evt.clientX - dragStart.x;
      const deltaY = evt.clientY - dragStart.y;
      const newX = scrollStart.x + deltaX;
      const newY = scrollStart.y + deltaY;
      setTranslate(newX, newY);
      evt.preventDefault();
    }
  }
  
  function onPointerUp(evt) {
    if (isDragging) {
      isDragging = false;
      evt.preventDefault();
      
      // Reset cursor
      const mainElement = document.getElementById('Main');
      if (mainElement) {
        mainElement.style.cursor = 'grab';
      }
    }
  }
  
  function onWheel(evt) {
    evt.preventDefault();
    
    const scrollMultiplier = 1.0;
    const deltaX = evt.deltaX * scrollMultiplier;
    const deltaY = evt.deltaY * scrollMultiplier;
    
    const currentTranslate = getCurrentTranslate();
    const newX = currentTranslate.x - deltaX;
    const newY = currentTranslate.y - deltaY;
    
    setTranslate(newX, newY);
  }
  
  function onTouchStart(evt) {
    if (evt.touches.length === 2) {
      evt.preventDefault();
      initialDistance = getDistance(evt.touches);
      startScale = scale;
    }
  }
  
  function onTouchMove(evt) {
    if (evt.touches.length === 2) {
      evt.preventDefault();
      const newDistance = getDistance(evt.touches);
      const factor = newDistance / initialDistance;
      const newScale = startScale * factor;
      setScale(newScale);
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    // Set initial cursor style
    const mainElement = document.getElementById('Main');
    if (mainElement) {
      mainElement.style.cursor = 'grab';
      // Prevent default touch behaviors that might interfere
      mainElement.style.touchAction = 'none';
      
      // Add pointer event listeners to Main element
      mainElement.addEventListener('pointerdown', onPointerDown);
      mainElement.addEventListener('pointermove', onPointerMove);
      mainElement.addEventListener('pointerup', onPointerUp);
      
      // Add wheel event listener to Main element
      mainElement.addEventListener('wheel', onWheel, { passive: false });
      
      // Add touch event listeners for pinch-to-zoom
      mainElement.addEventListener('touchstart', onTouchStart, { passive: false });
      mainElement.addEventListener('touchmove', onTouchMove, { passive: false });

      // Prevent any touch scroll / bounce on iOS Safari
      /*
      window.addEventListener('touchmove', (e) => {
        e.preventDefault()
      }, { passive: false })
      */
    }
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
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
