// Interactive drag+pinch functionality for JungleWriter sites.
// This script is included as interactive.js in the generated static site.
// It does not run in the editor itself.
// Allows clicking+dragging the canvas to scroll around.
// Also handles mouse wheel scrolling and touch events for mobile.
(function() {
  'use strict';

  class DragState {
    constructor(activePointers) {
      this.activePointers = activePointers;
      this._reset();
    }

    _reset() {
      this.pointerId = null;
      this.dragStart = null
      this.scrollStart = null;
      this.hasDragged = false;
    }

    onPointerDown(evt, mainElement) {
      if (this.pointerId !== null) {
        // Already dragging, ignore
        return;
      }
      this.pointerId = evt.pointerId;
      this.mainElement = mainElement;
      this.dragStart = { x: evt.clientX, y: evt.clientY }
      this.scrollStart = getCurrentTranslate();
      this.hasDragged = false;
      this.mainElement.style.cursor = 'grabbing';
    }

    onPointerMove(evt) {
      if (evt.pointerId !== this.pointerId) {
        // Not our pointer, ignore
        return;
      }
      const deltaX = evt.clientX - this.dragStart.x;
      const deltaY = evt.clientY - this.dragStart.y;

      // Check if we've moved enough to consider this a drag
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.hasDragged = true;
      }

      if (this.hasDragged) {
        setTranslate(this.scrollStart.x + deltaX, this.scrollStart.y + deltaY);
      }
    }

    onPointerUp(evt) {
      if (evt.pointerId !== this.pointerId) {
        // Not our pointer, ignore.
        return;
      }
      this.mainElement.style.cursor = 'grab';

      // If we dragged, prevent the next click event
      if (this.hasDragged) {
        const preventClick = (e) => {
          e.preventDefault();
          e.stopPropagation();
        };
        this.mainElement.addEventListener('click', preventClick, { capture: true, once: true });
        evt.preventDefault();
      }

      // If there is still a pointer down, switch to that one
      this._reset();
      if (this.activePointers.size > 0) {
        const nextPointer = this.activePointers.values().next().value;
        this.onPointerDown(nextPointer, this.mainElement);
      }
    }
  }

  class PinchState {
    constructor(activePointers) {
      this.activePointers = activePointers;
      this._reset();
    }

    _reset() {
      this.pointerOneId = null;
      this.pointerTwoId = null;
      this.initialDistance = null;
      this.startScale = null;
    }

    onPointerDown(evt, mainElement) {
      // No action needed on pointer down for pinch
      if (this.activePointers.size === 2) {
        this._reset();
        const touches = Array.from(this.activePointers.values());
        this.pointerOneId = touches[0].pointerId;
        this.pointerTwoId = touches[1].pointerId;
        this.initialDistance = getDistance(touches);
        this.startScale = getScale();
        evt.preventDefault();
      }  
    }

    onPointerMove(evt) {
      if (evt.pointerId !== this.pointerOneId && evt.pointerId !== this.pointerTwoId) {
        // Not our pointers, ignore.
        return;
      }
      const touches = Array.from(this.activePointers.values());
      const newDistance = getDistance(touches);
      const factor = newDistance / Math.max(this.initialDistance, 0.0001);
      setScale(this.startScale * factor);
    }

    onPointerUp(evt) {
      if (evt.pointerId !== this.pointerOneId && evt.pointerId !== this.pointerTwoId) {
        // Not our pointers, ignore.
        return;
      }
      this._reset();
    }
  }
  
  // Track pinch-to-zoom state
  let activePointers = new Map();
  let dragState = new DragState(activePointers);
  let pinchState = new PinchState(activePointers);
  
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
  
  // Get current scale value from CSS variable
  function getScale() {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return 1;
    
    const style = getComputedStyle(mainElement);
    return parseFloat(style.getPropertyValue('--canvas-scale')) || 1;
  }
  
  // Set scale value
  function setScale(newScale) {
    const mainElement = document.getElementById('Main');
    if (!mainElement) return;
    
    mainElement.style.setProperty('--canvas-scale', newScale);
  }
  
  // Calculate initial scale to fit design width to viewport
  function calculateInitialScale() {
    const designWidth = 800; // Design width in pixels
    const viewportWidth = window.innerWidth;
    const padding = 40; // Leave some padding on sides
    const availableWidth = viewportWidth - padding;
    
    // Calculate scale to fit design width, but don't scale up beyond 1.0
    const scale = Math.min(1.0, availableWidth / designWidth);
    return Math.max(0.1, scale); // Ensure minimum scale of 0.1
  }

  function isInteractiveTarget(el) {
    return el.closest('a, button, input, textarea, select, [data-no-drag]');
  }
  
  function onPointerDown(evt) {
    if (isInteractiveTarget(evt.target)) return; // Don't start dragging over links

    const mainElement = document.getElementById('Main');
    if (mainElement) {
      mainElement.setPointerCapture(evt.pointerId);
    }
    activePointers.set(evt.pointerId, evt);
    dragState.onPointerDown(evt, mainElement);
    pinchState.onPointerDown(evt, mainElement);
  }
  
  function onPointerMove(evt) {
    if (!activePointers.has(evt.pointerId)) return;
    activePointers.set(evt.pointerId, evt);
    dragState.onPointerMove(evt);
    pinchState.onPointerMove(evt);
  }

  function onPointerUp(evt) {
    if (!activePointers.has(evt.pointerId)) return;
    activePointers.delete(evt.pointerId);
    dragState.onPointerUp(evt);
    pinchState.onPointerUp(evt);
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
  
  // Initialize when DOM is ready
  function init() {
    const mainElement = document.getElementById('Main');
    if (mainElement) {
      mainElement.style.cursor = 'grab';
      // Prevent default touch behaviors that might interfere
      mainElement.style.touchAction = 'none';
      
      // Set initial scale to fit design width
      const initialScale = calculateInitialScale();
      setScale(initialScale);
      
      mainElement.addEventListener('pointerdown', onPointerDown);
      mainElement.addEventListener('pointermove', onPointerMove);
      mainElement.addEventListener('pointerup', onPointerUp);
      mainElement.addEventListener('wheel', onWheel, { passive: false });
    }
  }
  
  // Initialize when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
