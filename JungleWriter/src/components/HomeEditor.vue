<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

function onClickBackground(evt) {
  if (evt.target.id == "Main" || evt.target.id == "CanvasArea") {
    console.log("Clicked background, deselecting. TargetId: ", evt.target.id);
    gApp.site.deselectAll();
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

  const scrollAmount = 30; // pixels to scroll per keypress
  let handled = false;

  // Handle WASD keys for scrolling (always available)
  let offsetX = 0;
  let offsetY = 0;
  switch (evt.key.toLowerCase()) {
    case 'w':
      offsetY += -1.0;
      handled = true;
      break;
    case 'a':
      offsetX += -1.0;
      handled = true;
      break;
    case 's':
      offsetY += 1.0;
      handled = true;
      break;
    case 'd':
      offsetX += 1.0;
      handled = true;
      break;
  }
  if (offsetX !== 0 || offsetY !== 0) {
    // Normalize diagonal movement
    if (offsetX !== 0 && offsetY !== 0) {
      const norm = Math.sqrt(2);
      offsetX /= norm;
      offsetY /= norm;
    }
    offsetX *= scrollAmount;
    offsetY *= scrollAmount;
    gApp.site.scrollMainBy(offsetX, offsetY);
  }

  // Only handle arrow keys when editing and a node is selected
  if (!handled && gApp.site.isEditing && gApp.site.selectedEntity) {
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

function getMainStyleObject() {
  return gApp.site.getMainStyleObject();
}

let isEditing = computed(() => {
  return gApp.site?.getIsEditing();
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
})

onUnmounted(() => {
  //window.removeEventListener("resize", onPageResize);
  window.removeEventListener("keydown", onKeyDown);
})

</script>

<template>  
  <router-view></router-view>
  <main id="Main" @click="onClickBackground" :style="getMainStyleObject()">
    <div id="CanvasArea">
      <div class="AnchorDiv">
        <NodeWidget id="RootNode" :node="rootNode" />
      </div>
      <div v-if="isEditing" class="DesignAreaGuide">
      </div>
      <div v-if="isEditing" class="CenterIndicator">
        <i class="bi bi-plus-lg"></i>
      </div>
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
  border: 2px dashed white;
  border-radius: var(--border-radius-large);
  pointer-events: none;
}

.CenterIndicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  color: var(--medium-color);
  z-index: 1000;
  pointer-events: none;
}
</style>
