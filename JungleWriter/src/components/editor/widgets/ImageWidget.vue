<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidget, makeDraggableExt } from '../Utils.js'
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
  setupWidget(elementRef.value, props.node);
  //setupWidget(imgRef.value, props.node);
})

</script>

<template>
  <!--
  <div class="Widget ImageWidget"
       :style="node.getStyleObject()"
       ref="elementRef">
    <img class="Img" :src="node.getSrcUrl()" :alt="node.altText" @click="onClick" />
  </div>
  !-->
  <!--
  <img class="Widget ImageWidget"
       :style="node.getStyleObject()"
       ref="elementRef" @click="onClick"
       :src="node.getSrcUrl()" :alt="node.altText" />
  !-->
  <div class="Widget ImageWidget" ref="elementRef"
    :style="node.getStyleObject()">
    <img class="" :style="node.getImgStyleObject()"
         ref="imgRef"
         @click="onClick"
         :src="node.getSrcUrl()" :alt="node.altText" />
    <DragCorners :node="node" />
  </div>
</template>

<style scoped>
</style>

<style>
.ImageWidget {
  background-color: lightblue;
  position: relative;
}

.ImageWidget img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}

</style>

