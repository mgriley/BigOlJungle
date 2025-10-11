
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
  
  // Get current translate values from CSS variables
  function getCurrentTranslate() {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return { x: 0, y: 0 };
    
    const style = getComputedStyle(mainElement);
    const translateX = parseFloat(style.getPropertyValue('--translateX')) || 0;
    const translateY = parseFloat(style.getPropertyValue('--translateY')) || 0;
    
    return { x: translateX, y: translateY };
  }
  
  // Set translate values as CSS variables
  function setTranslate(x, y) {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return;
    
    mainElement.style.setProperty('--translateX', x + 'px');
    mainElement.style.setProperty('--translateY', y + 'px');
  }
  
  function getEventCoords(evt) {
    // Handle both mouse and touch events
    if (evt.touches && evt.touches.length > 0) {
      return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    }
    return { x: evt.clientX, y: evt.clientY };
  }
  
  function onPointerStart(evt) {
    // Check if we clicked/touched on Main or CanvasArea, or if the target is a descendant of Main
    const mainElement = document.getElementById('Main');
    const canvasElement = document.getElementById('CanvasArea');
    const isMainOrDescendant = evt.target.id === "Main" || 
                              evt.target.id === "CanvasArea" || 
                              (mainElement && mainElement.contains(evt.target));
    
    if (isMainOrDescendant) {
      // Start scroll drag
      isDragging = true;
      const coords = getEventCoords(evt);
      dragStart = { x: coords.x, y: coords.y };
      scrollStart = getCurrentTranslate();
      evt.preventDefault();
      
      // Set cursor to grabbing
      if (mainElement) {
        mainElement.style.cursor = 'grabbing';
      }
    }
  }
  
  function onPointerMove(evt) {
    if (isDragging) {
      const coords = getEventCoords(evt);
      const deltaX = coords.x - dragStart.x;
      const deltaY = coords.y - dragStart.y;
      
      const newX = scrollStart.x + deltaX;
      const newY = scrollStart.y + deltaY;
      
      setTranslate(newX, newY);
      evt.preventDefault();
    }
  }
  
  function onPointerEnd(evt) {
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
    // Check if the event target is #Main or #CanvasArea or a descendant of them
    const mainElement = document.getElementById('Main');
    const canvasElement = document.getElementById('CanvasArea');
    const target = evt.target;
    
    const isOverMain = target === mainElement || mainElement?.contains(target);
    const isOverCanvas = target === canvasElement || canvasElement?.contains(target);
    
    if (!isOverMain && !isOverCanvas) {
      return;
    }
    
    evt.preventDefault();
    
    const scrollMultiplier = 1.0;
    const deltaX = evt.deltaX * scrollMultiplier;
    const deltaY = evt.deltaY * scrollMultiplier;
    
    const currentTranslate = getCurrentTranslate();
    const newX = currentTranslate.x - deltaX;
    const newY = currentTranslate.y - deltaY;
    
    setTranslate(newX, newY);
  }
  
  function onTouchMove(evt) {
    if (isDragging) {
      onPointerMove(evt);
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
    }
    
    // Add mouse event listeners
    document.addEventListener('mousedown', onPointerStart);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerEnd);
    
    // Add touch event listeners
    document.addEventListener('touchstart', onPointerStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onPointerEnd, { passive: false });
    
    // Add wheel event listener
    document.addEventListener('wheel', onWheel, { passive: false });
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
