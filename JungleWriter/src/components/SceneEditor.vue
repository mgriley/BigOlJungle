<script setup>
import { reactive, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'
import ShortcutBtns from './ShortcutBtns.vue'
import { Node } from './Node.js'

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

// Track which keys are currently pressed
const keysPressed = ref(new Set());
let scrollAnimationId = null;

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

function shouldIgnoreKeyEvent() {
  // Don't handle keys if cursor is in a text input
  const activeElement = document.activeElement;
  return activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true'
  );
}

function handleNodeDuplication(evt) {
  const selectedNodes = gApp.site.getSelectedItems();
  if (gApp.site.isEditing && selectedNodes.length > 0 && 
      (evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'd') {
    
    // Filter out root nodes (can't be duplicated)
    const duplicatableNodes = selectedNodes.filter(node => !node.isRoot());
    
    if (duplicatableNodes.length > 0) {
      const clonedNodes = [];
      
      // Clone all selected nodes
      for (const node of duplicatableNodes) {
        const clonedNode = node.cloneAndAddAsSibling();
        clonedNodes.push(clonedNode);
      }
      
      // Select all the cloned nodes
      gApp.site.selectMany(clonedNodes);
      return true;
    }
  }
  return false;
}

function handleNodeDeletion(evt) {
  let selectedNodes = gApp.site.getSelectedItems();
  if (gApp.site.isEditing && selectedNodes.length > 0 && 
      (evt.key === 'Delete' || evt.key === 'Backspace')) {
    gApp.site.deleteSelectedNodes();
    return true;
  }
  return false;
}

function handleNodeResize(evt, selectedNodes) {
  const resizeAmount = 1; // pixels to resize per keypress
  let anyResized = false;
  
  for (const node of selectedNodes) {
    // Only resize if the node has width/height properties
    if (node.width !== undefined && node.height !== undefined) {
      switch (evt.key) {
        case 'ArrowLeft':
          // Shift left edge in (decrease width)
          node.width = Math.max(1, node.width - resizeAmount);
          anyResized = true;
          break;
        case 'ArrowRight':
          // Shift right edge out (increase width)
          node.width += resizeAmount;
          anyResized = true;
          break;
        case 'ArrowUp':
          // Shift top edge in (decrease height)
          node.height = Math.max(1, node.height - resizeAmount);
          anyResized = true;
          break;
        case 'ArrowDown':
          // Shift bottom edge out (increase height)
          node.height += resizeAmount;
          anyResized = true;
          break;
      }
    }
  }
  
  return anyResized;
}

function handleNodeMovement(evt, selectedNodes) {
  const moveAmount = 1; // pixels to move per keypress
  let delta = { deltaX: 0, deltaY: 0 };
  
  switch (evt.key) {
    case 'ArrowLeft':
      delta.deltaX = -moveAmount;
      break;
    case 'ArrowRight':
      delta.deltaX = moveAmount;
      break;
    case 'ArrowUp':
      delta.deltaY = -moveAmount;
      break;
    case 'ArrowDown':
      delta.deltaY = moveAmount;
      break;
    default:
      return false;
  }
  
  Node.moveNodes(selectedNodes, delta);
  return true;
}

function handleArrowKeys(evt) {
  const selectedNodes = gApp.site.getSelectedItems();
  
  // Only handle arrow keys when editing and nodes are selected
  if (!gApp.site.isEditing || selectedNodes.length === 0) {
    return false;
  }

  // Filter out root nodes (can't be moved/resized)
  const movableNodes = selectedNodes.filter(node => !node.isRoot());
  
  if (movableNodes.length === 0) {
    return false;
  }

  if (evt.shiftKey) {
    // Shift + arrow keys: resize the elements
    return handleNodeResize(evt, movableNodes);
  } else {
    // Regular arrow keys: move the elements
    return handleNodeMovement(evt, movableNodes);
  }
}

function onKeyDown(evt) {
  /**
   * Use arrow keys to move selected node when in editing mode.
   * With shift held, use arrow keys to resize the selected node.
   * Use WASD keys to scroll the main element.
   */ 
  
  if (shouldIgnoreKeyEvent()) {
    return;
  }

  let handled = false;

  // Handle WASD keys for scrolling (if feature flag is enabled)
  if (!handled) {
    handled = handleWASDScrolling(evt);
  }

  // Handle Ctrl/Cmd+D for duplicating selected node
  if (!handled) {
    handled = handleNodeDuplication(evt);
  }

  // Handle Delete/Backspace for deleting selected node
  if (!handled) {
    handled = handleNodeDeletion(evt);
  }

  // Handle arrow keys for movement/resizing
  if (!handled) {
    handled = handleArrowKeys(evt);
  }

  if (handled) {
    evt.preventDefault();
    evt.stopPropagation();
  }
}


function onKeyUp(evt) {
  const key = evt.key.toLowerCase();
  if (gApp.site.settings.enableWASDNavigation && ['w', 'a', 's', 'd'].includes(key)) {
    keysPressed.value.delete(key);
    if (keysPressed.value.size === 0 && scrollAnimationId) {
      cancelAnimationFrame(scrollAnimationId);
      scrollAnimationId = null;
    }
  }
}

function getMainStyleObject() {
  return gApp.site.getMainStyleObject();
}

let isEditing = computed(() => {
  return gApp.site?.getIsEditing();
});

let mainCursor = computed(() => {
  if (isEditing.value) {
    //return isSelectionDragging.value ? 'crosshair' : 'default';
    return 'default';
  }
  return isDragging.value ? 'grabbing' : 'grab';
});

let selectionRectStyle = computed(() => {
  if (!isSelectionDragging.value) {
    return { display: 'none' };
  }
  
  const startX = Math.min(selectionDragStart.value.x, selectionDragCurrent.value.x);
  const startY = Math.min(selectionDragStart.value.y, selectionDragCurrent.value.y);
  const width = Math.abs(selectionDragCurrent.value.x - selectionDragStart.value.x);
  const height = Math.abs(selectionDragCurrent.value.y - selectionDragStart.value.y);
  
  return {
    position: 'fixed',
    left: startX + 'px',
    top: startY + 'px',
    width: width + 'px',
    height: height + 'px',
    //border: '2px dashed #007bff',
    //backgroundColor: 'rgba(0, 123, 255, 0.1)',
    border: '3px dashed purple',
    backgroundColor: 'rgba(255,0,255,0.1)',
    pointerEvents: 'none',
    zIndex: 1000
  };
});

/*
function startScrollAnimation() {
  const scrollSpeed = 10; // pixels per frame
  
  function animate() {
    if (keysPressed.value.size === 0) {
      scrollAnimationId = null;
      return;
    }

    let offsetX = 0;
    let offsetY = 0;

    // Calculate movement based on pressed keys
    if (keysPressed.value.has('w')) offsetY -= 1;
    if (keysPressed.value.has('s')) offsetY += 1;
    if (keysPressed.value.has('a')) offsetX -= 1;
    if (keysPressed.value.has('d')) offsetX += 1;

    // Normalize diagonal movement
    if (offsetX !== 0 && offsetY !== 0) {
      const norm = Math.sqrt(2);
      offsetX /= norm;
      offsetY /= norm;
    }

    // Apply scrolling
    if (offsetX !== 0 || offsetY !== 0) {
      gApp.site.scrollMainBy(offsetX * scrollSpeed, offsetY * scrollSpeed);
    }

    scrollAnimationId = requestAnimationFrame(animate);
  }

  scrollAnimationId = requestAnimationFrame(animate);
}
*/

/*
function handleWASDScrolling(evt) {
  const key = evt.key.toLowerCase();
  if (gApp.site.settings.enableWASDNavigation && ['w', 'a', 's', 'd'].includes(key)) {
    keysPressed.value.add(key);
    if (!scrollAnimationId) {
      startScrollAnimation();
    }
    return true;
  }
  return false;
}
*/

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

function onPageResize() {
  // Update the site's page dimensions when window is resized
  if (gApp.site) {
    console.log(`Window resized to ${window.innerWidth}x${window.innerHeight}`);
    gApp.site.pageWidth = window.innerWidth;
    gApp.site.pageHeight = window.innerHeight;
  }
}

function setupCustomCssWatcher() {
  // Watch for changes to the site's custom CSS string
  watch(
    () => gApp.site?.customCssString,
    (newCssString) => {
      updateCustomCssStyleTag(newCssString || '');
    },
    { immediate: true }
  );
}

function updateCustomCssStyleTag(cssString) {
  // Remove existing custom CSS style tag if it exists
  removeCustomCssStyleTag();
  
  // Add new style tag if CSS string is not empty
  if (cssString.trim()) {
    const styleTag = document.createElement('style');
    styleTag.id = 'junglewriter-custom-css';
    styleTag.textContent = cssString;
    document.head.appendChild(styleTag);
  }
}

function removeCustomCssStyleTag() {
  const existingStyleTag = document.getElementById('junglewriter-custom-css');
  if (existingStyleTag) {
    existingStyleTag.remove();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("wheel", onWheel, { passive: false });

  window.addEventListener("resize", onPageResize);
  onPageResize();
  
  // Set up watcher for custom CSS
  setupCustomCssWatcher();
})

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("mousedown", onMouseDown);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
  window.removeEventListener("wheel", onWheel);

  window.removeEventListener("resize", onPageResize);
  
  // Clean up animation frame if still running
  if (scrollAnimationId) {
    cancelAnimationFrame(scrollAnimationId);
  }
  
  // Clean up custom CSS
  removeCustomCssStyleTag();
})

</script>

<template>  
  <router-view></router-view>
  <main id="Main" @click="onClickBackground" :style="{...getMainStyleObject(), cursor: mainCursor}">
    <ShortcutBtns />
    <div id="CanvasArea">
      <div class="AnchorDiv">
        <NodeWidget id="RootNode" :node="rootNode" />
      </div>
      <div v-if="isEditing && gApp.site.settings.showDesignGuide" class="DesignAreaGuide">
      </div>
      <!--
      <div v-if="isEditing" class="CenterIndicator">
        <i class="bi bi-plus-lg"></i>
      </div>
      -->
    </div>
    <!-- Selection rectangle overlay -->
    <div v-if="isSelectionDragging" class="SelectionRect" :style="selectionRectStyle"></div>
  </main>
</template>

<style scoped>
.DesignAreaGuide {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--design-width);
  height: var(--design-height);
  transform: translate(-50%, -50%);
  border: 2px dashed var(--design-guide-color);
  border-radius: var(--border-radius-large);
  pointer-events: none;
  z-index: -1;
}

.CenterIndicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  color: var(--design-guide-color);
  pointer-events: none;
  z-index: -1;
}
</style>
