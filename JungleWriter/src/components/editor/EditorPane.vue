<script setup>
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { gApp } from './State.js'
import { makeDraggable, readFromStorage, writeToStorage, prettyJson } from './Utils.js'
import { EditorPaneSettings } from './EditorPane.js'

const props = defineProps({
  paneTitle: String,
  // Must be unique among all panes
  paneId: {
    type: String,
    required: true
  },
  startX: Number,
  startY: Number,
})

const paneRef = ref(null)
let settings = reactive(new EditorPaneSettings());

let intervalId = null;
onMounted(() => {
  settings.posX = props.startX + 'px';
  settings.posY = props.startY + 'px';
  readFromStorage(settings, gApp.userStorage, `app/workspace/panes/${props.paneId}`);
  paneRef.value.style.left = settings.posX;
  paneRef.value.style.top = settings.posY;
  makeDraggable(paneRef.value);

  intervalId = setInterval(() => {
    // Update settings
    settings.posX = paneRef.value.style.left;
    settings.posY = paneRef.value.style.top;
    writeToStorage(settings, gApp.userStorage, `app/workspace/panes/${props.paneId}`);
    console.log("Saving pane settings:", prettyJson(settings.writeToJson())); 
  }, 3000);
})

onUnmounted(() => {
  clearInterval(intervalId);
})

</script>

<template>
  <div class="EditorPane" ref="paneRef">
    <div class="EditorPaneHeader">
      <div>
        {{ paneTitle }}
      </div>
      <button @click="settings.isCollapsed = !settings.isCollapsed" class="CollapseBtn TextButton">
        {{ settings.isCollapsed ? "[+]" : "[-]" }}
      </button>
    </div>  
    <div class="PaneInner" v-if="!settings.isCollapsed"> 
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
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
}

.CollapseBtn {
  margin: 0;
  margin-left: var(--space-xs);
  padding: 0px;
  min-width: 0;
}

.PaneInner {
  padding: var(--space-xs) var(--space-s) var(--space-s) var(--space-s);
}

</style>
