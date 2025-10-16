import { ref } from 'vue'
import { gApp } from './State.js'

// Track drag state for scrolling
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const scrollStart = ref({ x: 0, y: 0 });

// Track selection rectangle drag state
const isSelectionDragging = ref(false);
const selectionDragStart = ref({ x: 0, y: 0 });
const selectionDragCurrent = ref({ x: 0, y: 0 });
const selectionHasDragged = ref(false);

function onClickBackground(evt) {
  if (evt.target.id == "Main" || evt.target.id == "CanvasArea") {
    console.log("Clicked background, deselecting. TargetId: ", evt.target.id);
    gApp.site.deselectAll();
  }
}

function onMouseDown(evt) {
  console.log("SCENE EDITOR MOUSEDOWN", evt.target);
  
  // Check if we clicked on Main or CanvasArea, or if the target is a descendant of Main
  const mainElement = document.getElementById('Main');
  const canvasElement = document.getElementById('CanvasArea');
  const isMainOrDescendant = evt.target.id === "Main" || 
                            evt.target.id === "CanvasArea" || 
                            (mainElement && mainElement.contains(evt.target));
  
  if (isMainOrDescendant) {
    if (gApp.site.isEditing) {
      // Start selection rectangle drag
      isSelectionDragging.value = true;
      selectionDragStart.value = { x: evt.clientX, y: evt.clientY };
      selectionDragCurrent.value = { x: evt.clientX, y: evt.clientY };
      selectionHasDragged.value = false;
      evt.preventDefault();
      return;
    } else {
      // Start scroll drag when not editing
      isDragging.value = true;
      dragStart.value = { x: evt.clientX, y: evt.clientY };
      scrollStart.value = { x: gApp.site.translateX, y: gApp.site.translateY };
      evt.preventDefault();
      return;
    }
  }
}

function onMouseMove(evt) {
  if (isDragging.value) {
    const deltaX = evt.clientX - dragStart.value.x;
    const deltaY = evt.clientY - dragStart.value.y;
    
    gApp.site.translateX = scrollStart.value.x + deltaX;
    gApp.site.translateY = scrollStart.value.y + deltaY;
    
    evt.preventDefault();
  } else if (isSelectionDragging.value) {
    const deltaX = Math.abs(evt.clientX - selectionDragStart.value.x);
    const deltaY = Math.abs(evt.clientY - selectionDragStart.value.y);
    
    // Check if we've moved enough to consider this a drag
    if (deltaX > 3 || deltaY > 3) {
      selectionHasDragged.value = true;
    }
    
    selectionDragCurrent.value = { x: evt.clientX, y: evt.clientY };
    evt.preventDefault();
  }
}

function onMouseUp(evt) {
  if (isDragging.value) {
    isDragging.value = false;
    evt.preventDefault();
  } else if (isSelectionDragging.value) {
    isSelectionDragging.value = false;
    
    // If we dragged, prevent click events on widgets and select nodes in region
    if (selectionHasDragged.value) {
      // Add event listener to capture and prevent click events
      document.addEventListener("click", preventClickAfterDrag, { capture: true, once: true });
      
      // Calculate selection rectangle
      const startX = Math.min(selectionDragStart.value.x, selectionDragCurrent.value.x);
      const startY = Math.min(selectionDragStart.value.y, selectionDragCurrent.value.y);
      const width = Math.abs(selectionDragCurrent.value.x - selectionDragStart.value.x);
      const height = Math.abs(selectionDragCurrent.value.y - selectionDragStart.value.y);
      
      // Convert screen coordinates to AnchorDiv coordinates
      const anchorElement = document.querySelector('.AnchorDiv');
      if (anchorElement) {
        const anchorRect = anchorElement.getBoundingClientRect();
        const canvasX = startX - anchorRect.left;
        const canvasY = startY - anchorRect.top;
        
        const selectionRect = {
          x: canvasX,
          y: canvasY,
          w: width,
          h: height
        };
        console.log(`Selection rect: x=${canvasX}, y=${canvasY}, w=${width}, h=${height}`);
        
        // Select nodes in the region
        gApp.site.selectNodesInRegion(selectionRect, evt);
      }
    }
    
    evt.preventDefault();
  }
}

function preventClickAfterDrag(evt) {
  evt.preventDefault();
  evt.stopPropagation();
}

function onWheel(evt) {
  /**
   * Handle mouse wheel scrolling to manually control scroll behavior
   * Only when mouse is over #Main or #CanvasArea elements
   * Don't consume the event if mouse is over a BasicModal
   */
  
  // Check if the event target is inside a BasicModal
  const target = evt.target;
  const modalElement = target.closest('.BasicModal');
  
  if (modalElement) {
    return; // Don't consume the event, let the modal handle scrolling
  }
  
  // Check if the event target is #Main or #CanvasArea or a descendant of them
  const mainElement = document.getElementById('Main');
  const canvasElement = document.getElementById('CanvasArea');
  
  const isOverMain = target === mainElement || mainElement?.contains(target);
  const isOverCanvas = target === canvasElement || canvasElement?.contains(target);
  
  if (!isOverMain && !isOverCanvas) {
    return;
  }
  
  evt.preventDefault();
  
  const scrollMultiplier = 1.0; // Adjust sensitivity as needed
  const deltaX = evt.deltaX * scrollMultiplier;
  const deltaY = evt.deltaY * scrollMultiplier;
  
  gApp.site.scrollMainBy(deltaX, deltaY);
}

function getSelectionRect() {
  if (!isSelectionDragging.value) {
    return null;
  }
  
  const startX = Math.min(selectionDragStart.value.x, selectionDragCurrent.value.x);
  const startY = Math.min(selectionDragStart.value.y, selectionDragCurrent.value.y);
  const width = Math.abs(selectionDragCurrent.value.x - selectionDragStart.value.x);
  const height = Math.abs(selectionDragCurrent.value.y - selectionDragStart.value.y);
  
  return {
    x: startX,
    y: startY,
    width: width,
    height: height
  };
}

let canvasElement = null;

function installHandlers(canvas) {
  canvasElement = canvas;
  if (canvasElement) {
    canvasElement.addEventListener("mousedown", onMouseDown);
    canvasElement.addEventListener("mousemove", onMouseMove);
    canvasElement.addEventListener("mouseup", onMouseUp);
    canvasElement.addEventListener("wheel", onWheel, { passive: false });
  }
}

function removeHandlers() {
  if (canvasElement) {
    canvasElement.removeEventListener("mousedown", onMouseDown);
    canvasElement.removeEventListener("mousemove", onMouseMove);
    canvasElement.removeEventListener("mouseup", onMouseUp);
    canvasElement.removeEventListener("wheel", onWheel);
    canvasElement = null;
  }
}

export {
  isDragging,
  getSelectionRect,
  onClickBackground,
  installHandlers,
  removeHandlers
}
