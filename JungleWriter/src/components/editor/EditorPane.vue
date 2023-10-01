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
  paneRef.value.style.left = props.startX + 'px';
  paneRef.value.style.top = props.startY + 'px';
  makeDraggable(paneRef.value);
})

</script>

<template>
  <div class="EditorPane" ref="paneRef">
    <div class="EditorPaneHeader">
      {{ paneTitle }}
    </div>  
    <div class="PaneInner"> 
      <slot></slot>
    </div>
  </div>
</template>

<style>
.EditorPane {
  position: absolute;
  z-index: 9;
  background-color: var(--popup-bg);
  /* border: var(--border-reg); */
  border-radius: var(--border-radius-large);
  min-width: 300px;
  /*height: 400px;*/
  /*
  overflow: auto;
  resize: both;
  */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.33);
}

.EditorPaneHeader {
  padding: var(--space-xs) var(--space-s);
  cursor: move;
  /* background-color: var(--light-color); */
  background-color: var(--editor-header-color);
}

.PaneInner {
  padding: var(--space-xs) var(--space-s) var(--space-s) var(--space-s);
}

</style>
