<script setup>
import { ref, onMounted } from 'vue'
import { makeDraggable } from './Utils.js'

const props = defineProps({
  paneTitle: String,
  startX: Number,
  startY: Number,
})

const paneRef = ref(null)

onMounted(() => {
  makeDraggable(paneRef.value);
})

</script>

<template>
  <div class="EditorPane" ref="paneRef" :style="{left: startX + 'px', top: startY + 'px'}">
    <div class="EditorPaneHeader">{{ paneTitle }}</div>  
    <div class="PaneInner"> 
      <slot></slot>
    </div>
  </div>
</template>

<style>
.EditorPane {
  position: absolute;
  z-index: 9;
  /*background-color: #0000;*/
  background: var(--color-background);
  border: 1px solid #d3d3d3;
  width: 300px;
  /*height: 400px;*/
}

.EditorPaneHeader {
  padding: 5px 20px;
  cursor: move;
  z-index: 10;
  background-color: #2196F3;
  color: #fff;
}

.PaneInner {
  padding: 20px 5px;
}

</style>
