<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'

let canvasBaseWidth = 600;
// let canvasAspectRatio = 9.0 / 16.0;
let canvasAspectRatio = 3.0 / 4.0;

let canvasStyleObj = reactive({
  '--canvasWidth': canvasBaseWidth + 'px',
  '--canvasHeight': canvasBaseWidth / canvasAspectRatio + 'px',
  'transform': 'scale(1.0)',
});

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

function onClickBackground(evt) {
  /*console.log("TargetId: "+evt.target.id);*/
  if (evt.target.id == "Main") {
    gApp.site.deselectAll();
  }
}

function getMainStyleObject() {
  return {
    'background-color': gApp.site.getSettings().backgroundColor
  };
}

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

function clamp(x, a, b) {
  return Math.max(a, Math.min(x, b));
}

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
    <!--<h1>Hello World!</h1>-->

    <div class="CanvasArea" :style="canvasStyleObj">
      <div class="AnchorDiv">
        <NodeWidget :node="rootNode" />
      </div>
    </div>
  </main>
</template>

<style scoped>

main {
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.CanvasArea {
  /* TODO */
  background-color: white;
  margin-left: auto;
  margin-right: auto;
  width: var(--canvasWidth);
  height: var(--canvasHeight);
  border-radius: 4px;
}

.AnchorDiv {
  position: absolute;  
  /*width: auto;*/
  top: 50%;
  left: 50%;
  width: 0px;
  height: 0px;
  /*-webkit-transform: translate(-50%, -50%);*/
  /*transform: translate(-50%, -50%);*/
}

</style>
