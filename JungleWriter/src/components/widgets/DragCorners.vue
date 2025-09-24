<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  node: Object
})

let dragCornerTL = ref(null);
let dragCornerTR = ref(null);
let dragCornerBR = ref(null);
let dragCornerBL = ref(null);

function setupDragCorner(widgetElem, node, dirX, dirY) {
  var dragObj = {
    origWidth: null,
    origHeight: null,
  };
  makeDraggableExt(widgetElem, {
    allowDrag: () => {
      return node.isSelected() && !node.interaction;
    },
    onStart: (startX, startY) => {
      node.interaction = 'resize';
      dragObj.origWidth = node.width;
      dragObj.origHeight = node.height;
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      node.width = dragObj.origWidth + dirX * diffX;
      node.height = dragObj.origHeight + dirY * diffY;
    },
    onEnd: () => {
      node.interaction = null;
    },
  })
}

onMounted(() => {
  //setupDragCorner(dragCornerTL.value, props.node, -1, -1);
  //setupDragCorner(dragCornerTR.value, props.node, 1, -1);
  setupDragCorner(dragCornerBR.value, props.node, 1, 1);
  //setupDragCorner(dragCornerBL.value, props.node, -1, 1);
})

</script>

<template>
  <!-- <div ref="dragCornerTL" class="DragCorner TL"></div>     -->
  <!-- <div ref="dragCornerTR" class="DragCorner TR"></div>     -->
  <div ref="dragCornerBR" class="DragCorner BR"></div>    
  <!-- <div ref="dragCornerBL" class="DragCorner BL"></div>     -->
</template>

<style scoped>
</style>

<style>
.DragCorner {
  background-color: red;
  width: 12px;
  height: 12px;
  position: absolute;
}

.TL {
  top: -10px;
  left: -10px;
}

.TR {
  top: 0;
  right: 0;
}

.BR {
  bottom: -10px;
  right: -10px;
}

.BL {
  bottom: 0;
  left: 0;
}

</style>

