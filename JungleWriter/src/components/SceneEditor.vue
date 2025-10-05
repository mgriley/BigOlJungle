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

function onClickBackground(evt) {
  if (evt.target.id == "Main" || evt.target.id == "CanvasArea") {
    console.log("Clicked background, deselecting. TargetId: ", evt.target.id);
    gApp.site.deselectAll();
  }
}

function onMouseDown(evt) {
  // Only handle drag scrolling when not editing
  if (gApp.site.isEditing) {
    return;
  }

  isDragging.value = true;
  dragStart.value = { x: evt.clientX, y: evt.clientY };
  scrollStart.value = { x: gApp.site.translateX, y: gApp.site.translateY };
  
  evt.preventDefault();
}

function onMouseMove(evt) {
  if (!isDragging.value) {
    return;
  }

  const deltaX = evt.clientX - dragStart.value.x;
  const deltaY = evt.clientY - dragStart.value.y;
  
  gApp.site.translateX = scrollStart.value.x + deltaX;
  gApp.site.translateY = scrollStart.value.y + deltaY;
  
  evt.preventDefault();
}

function onMouseUp(evt) {
  if (isDragging.value) {
    isDragging.value = false;
    evt.preventDefault();
  }
}

function onKeyDown(evt) {
  /**
   * Use arrow keys to move selected node when in editing mode.
   * With shift held, use arrow keys to resize the selected node.
   * Use WASD keys to scroll the main element.
   */ 
  
  // Don't handle keys if cursor is in a text input
  const activeElement = document.activeElement;
  if (activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true'
  )) {
    return;
  }

  let handled = false;
  const key = evt.key.toLowerCase();

  // Handle WASD keys for scrolling (if feature flag is enabled)
  if (gApp.site.settings.enableWASDNavigation && ['w', 'a', 's', 'd'].includes(key)) {
    keysPressed.value.add(key);
    if (!scrollAnimationId) {
      startScrollAnimation();
    }
    handled = true;
  }

  // Handle Ctrl/Cmd+D for duplicating selected node
  if (!handled && gApp.site.isEditing && gApp.site.selectedEntity && 
      (evt.ctrlKey || evt.metaKey) && evt.key.toLowerCase() === 'd') {
    const selectedNode = gApp.site.selectedEntity;
    if (!selectedNode.isRoot()) {
      let clonedNode = selectedNode.cloneAndAddAsSibling();
      gApp.site.selectNode(clonedNode);
      handled = true;
    }
  }

  // Handle Delete/Backspace for deleting selected node
  if (!handled && gApp.site.isEditing && gApp.site.selectedEntity && 
      (evt.key === 'Delete' || evt.key === 'Backspace')) {
    const selectedNode = gApp.site.selectedEntity;
    if (!selectedNode.isRoot()) {
      gApp.site.deleteSelectedNodes();
      handled = true;
    }
  }

  // Only handle arrow keys when editing and a node is selected
  if (!handled && gApp.site.isEditing && gApp.site.selectedEntity &&
      !gApp.site.selectedEntity.isRoot()) {
    const moveAmount = 1; // pixels to move per keypress
    const resizeAmount = 1; // pixels to resize per keypress
    const selectedNode = gApp.site.selectedEntity;

    if (evt.shiftKey) {
      // Shift + arrow keys: resize the element
      // Only resize if the node has width/height properties
      if (selectedNode.width !== undefined && selectedNode.height !== undefined) {
        switch (evt.key) {
          case 'ArrowLeft':
            // Shift left edge in (decrease width)
            selectedNode.width = Math.max(1, selectedNode.width - resizeAmount);
            handled = true;
            break;
          case 'ArrowRight':
            // Shift right edge out (increase width)
            selectedNode.width += resizeAmount;
            handled = true;
            break;
          case 'ArrowUp':
            // Shift top edge in (decrease height)
            selectedNode.height = Math.max(1, selectedNode.height - resizeAmount);
            handled = true;
            break;
          case 'ArrowDown':
            // Shift bottom edge out (increase height)
            selectedNode.height += resizeAmount;
            handled = true;
            break;
        }
      }
    } else {
      // Regular arrow keys: move the element
      switch (evt.key) {
        case 'ArrowLeft':
          selectedNode.posX -= moveAmount;
          handled = true;
          break;
        case 'ArrowRight':
          selectedNode.posX += moveAmount;
          handled = true;
          break;
        case 'ArrowUp':
          selectedNode.posY -= moveAmount;
          handled = true;
          break;
        case 'ArrowDown':
          selectedNode.posY += moveAmount;
          handled = true;
          break;
      }
    }
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
    return 'default';
  }
  return isDragging.value ? 'grabbing' : 'grab';
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
