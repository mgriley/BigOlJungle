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
  console.log("Clicked background. TargetId: " + evt.target.id);
  if (evt.target.id == "Main") {
    gApp.site.deselectAll();
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
})

onUnmounted(() => {
  //window.removeEventListener("resize", onPageResize);
})

</script>

<template>  
  <router-view></router-view>
  <main id="Main" @click="onClickBackground" :style="getMainStyleObject()">
    <div class="CanvasArea" :style="canvasStyleObj">
      <div class="AnchorDiv">
        <NodeWidget :node="rootNode" />
      </div>
    </div>
  </main>
</template>

<style scoped>
</style>
