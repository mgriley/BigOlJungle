<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag, makeDraggableExt } from '../Utils.js'
import { ImageNode } from './ImageNode.js'
import DragCorners from './DragCorners.vue'

const props = defineProps({
  node: Object
})

function onClick() {
  gApp.site.selectNode(props.node);
}

let elementRef = ref(null);
let imgRef = ref(null);

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
  //setupWidgetDrag(imgRef.value, props.node);
})

</script>

<template>
  <div class="Widget RectWidget" ref="elementRef"
    :style="node.getStyleObject()" @click="onClick">
    <DragCorners v-if="node.selected" :node="node" />
  </div>
</template>

<style scoped>
</style>

<style>
.RectWidget {
  background-color: lightblue;
}

</style>

