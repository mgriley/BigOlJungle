<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag, makeDraggableExt } from '../Utils.js'
import { ImageNode } from './ImageNode.js'
import DragCorners from './DragCorners.vue'

const props = defineProps({
  node: Object
})

function onClick(evt) {
  if (gApp.site.isEditing) {
    console.log("CLICKED RECT WIDGET");
    gApp.site.handleNodeClick(props.node, evt);
  }
}

let elementRef = ref(null);
let imgRef = ref(null);

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
  //setupWidgetDrag(imgRef.value, props.node);
})

</script>

<template>
  <div :id="node.getElementId()" class="Widget RectWidget" :class="node.getElementClassesDict()" ref="elementRef"
    :style="node.getStyleObject()" @click="onClick">
    <DragCorners v-if="node.selected" :node="node" />
  </div>
</template>

<style scoped>
</style>

<style>
</style>

