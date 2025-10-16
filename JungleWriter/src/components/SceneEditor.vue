<script setup>
import { reactive, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'
import ShortcutBtns from './ShortcutBtns.vue'
import { Node } from './Node.js'
import { onKeyDown, onKeyUp, cleanup as keyHandlerCleanup } from './SceneKeyHandler.js'

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

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

function getMainStyleObject() {
  return gApp.site.getMainStyleObject();
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
  
  // Clean up key handler
  keyHandlerCleanup();
  
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
