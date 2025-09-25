<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'

let canvasStyleObj = computed(() => {
  return gApp.site.getCanvasStyleObject();
})

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
   */ 
  // Only handle arrow keys when editing and a node is selected
  if (!gApp.site.isEditing || !gApp.site.selectedEntity) {
    return;
  }

  // Don't handle arrow keys if cursor is in a text input
  const activeElement = document.activeElement;
  if (activeElement && (
    activeElement.tagName === 'INPUT' || 
    activeElement.tagName === 'TEXTAREA' || 
    activeElement.contentEditable === 'true'
  )) {
    return;
  }

  const moveAmount = 1; // pixels to move per keypress
  let handled = false;

  switch (evt.key) {
    case 'ArrowLeft':
      gApp.site.selectedEntity.posX -= moveAmount;
      handled = true;
      break;
    case 'ArrowRight':
      gApp.site.selectedEntity.posX += moveAmount;
      handled = true;
      break;
    case 'ArrowUp':
      gApp.site.selectedEntity.posY -= moveAmount;
      handled = true;
      break;
    case 'ArrowDown':
      gApp.site.selectedEntity.posY += moveAmount;
      handled = true;
      break;
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
  return gApp.site.getIsEditing();
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
    <div id="CanvasArea" class="CanvasArea" :style="canvasStyleObj">
      <div class="AnchorDiv">
        <NodeWidget :node="rootNode" />
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
