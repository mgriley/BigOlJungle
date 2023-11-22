<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag, makeDraggableExt } from '../Utils.js'
import { ImageNode } from './ImageNode.js'
import DragCorners from './DragCorners.vue'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);
let imgRef = ref(null);

function onClick() {
  if (gApp.site.isEditing) {
    gApp.site.selectNode(props.node);
  }
}

function onLinkClicked(evt) {
  if (gApp.site.isEditing) {
    evt.preventDefault();
  }
}

let isImgLink = computed(() => {
  return props.node.linkUrl !== "";
});

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
  //setupWidgetDrag(imgRef.value, props.node);
})

</script>

<template>
  <div class="Widget ImageWidget" ref="elementRef"
    :style="node.getStyleObject()" @click="onClick">
    <a :class="{DisabledLink: !isImgLink}" :href="node.linkUrl"
      target="_blank" @click="onLinkClicked">
      <img class="" :style="node.getImgStyleObject()"
           ref="imgRef"
           :src="node.getSrcUrl()" :alt="node.altText" />
    </a>
    <DragCorners v-if="node.selected" :node="node" />
  </div>
</template>

<style scoped>
</style>

<style>
.ImageWidget {
  /* background-color: lightblue; */
  position: relative;
}

.ImageWidget img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  overflow: hidden;
}

.DisabledLink {
  pointer-events: none;
}

</style>

