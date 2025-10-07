<script setup>
import { reactive, computed, onMounted, onUnmounted, ref } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'
import ShortcutBtns from './ShortcutBtns.vue'

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
    
    // If we dragged, prevent click events on widgets
    if (selectionHasDragged.value) {
      // Add event listener to capture and prevent click events
      document.addEventListener("click", preventClickAfterDrag, { capture: true, once: true });
    }
    
    // onDone handler - leave blank for now
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
  let anyMoved = false;
  
  for (const node of selectedNodes) {
    switch (evt.key) {
      case 'ArrowLeft':
        node.posX -= moveAmount;
        anyMoved = true;
        break;
      case 'ArrowRight':
        node.posX += moveAmount;
        anyMoved = true;
        break;
      case 'ArrowUp':
        node.posY -= moveAmount;
        anyMoved = true;
        break;
      case 'ArrowDown':
        node.posY += moveAmount;
        anyMoved = true;
        break;
    }
  }
  
  return anyMoved;
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
    border: '1px dashed #007bff',
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    pointerEvents: 'none',
    zIndex: 1000
  };
});

function clamp(x, a, b) {
  return Math.max(a, Math.min(x, b));
}

// TODO - currently unused
/*
function onPageResize() {
  // Note: could impl debounce later.
  // See: https://web.archive.org/web/20220714020647/https://bencentra.com/code/2015/02/27/optimizing-window-resize.html

  // Resize so that the canvas square is contained in the page/window area, as large as possible
  let margin = 64;
  let newWidth = window.innerWidth - margin * 2;
  let newHeight = window.innerHeight - margin * 2;
  let scaleAmt = Math.min(
    newWidth / canvasBaseWidth, newHeight / (canvasBaseWidth / canvasAspectRatio));
  scaleAmt = clamp(scaleAmt, 0, 1);
  canvasStyleObj['transform'] = `scale(${scaleAmt})`;
}
*/

onMounted(() => {
  //window.addEventListener("resize", onPageResize);
  //onPageResize();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
})

onUnmounted(() => {
  //window.removeEventListener("resize", onPageResize);
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  window.removeEventListener("wheel", onWheel);
  window.removeEventListener("mousedown", onMouseDown);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
  
  // Clean up animation frame if still running
  if (scrollAnimationId) {
    cancelAnimationFrame(scrollAnimationId);
  }
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
      <div v-if="isEditing" class="DesignAreaGuide">
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
  width: 800px;
  height: 600px;
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
