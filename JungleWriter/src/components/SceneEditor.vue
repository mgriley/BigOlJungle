<script setup>
import { reactive, computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { gApp } from './State.js'
import NodeWidget from './widgets/NodeWidget.vue'
import ShortcutBtns from './ShortcutBtns.vue'
import { Node } from './Node.js'
import { installHandlers as installKeyHandlers, removeHandlers as removeKeyHandlers } from './SceneKeyHandler.js'
import { 
  isScrollDragging, 
  getSelectionRect,
  onClickBackground,
  installHandlers as installMouseHandlers,
  removeHandlers as removeMouseHandlers
} from './SceneMouseHandler.js'

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

function onPageResize() {
  // Update the site's page dimensions when window is resized
  if (gApp.site) {
    console.log(`Window resized to ${window.innerWidth}x${window.innerHeight}`);
    gApp.site.pageWidth = window.innerWidth;
    gApp.site.pageHeight = window.innerHeight;
  }
}

function setupCustomCssWatcher() {
  // Watch for changes to the site's custom CSS string
  watch(
    () => gApp.site?.customCssString,
    (newCssString) => {
      updateCustomCssStyleTag(newCssString || '');
    },
    { immediate: true }
  );
}

function updateCustomCssStyleTag(cssString) {
  // Remove existing custom CSS style tag if it exists
  removeCustomCssStyleTag();
  
  // Add new style tag if CSS string is not empty
  if (cssString.trim()) {
    const styleTag = document.createElement('style');
    styleTag.id = 'junglewriter-custom-css';
    styleTag.textContent = cssString;
    document.head.appendChild(styleTag);
  }
}

function removeCustomCssStyleTag() {
  const existingStyleTag = document.getElementById('junglewriter-custom-css');
  if (existingStyleTag) {
    existingStyleTag.remove();
  }
}

let isEditing = computed(() => {
  return gApp.site?.getIsEditing();
});

let mainCursor = computed(() => {
  if (isEditing.value) {
    //return getSelectionRect() ? 'crosshair' : 'default';
    return 'default';
  }
  return isScrollDragging.value ? 'grabbing' : 'grab';
});

let selectionRectStyle = computed(() => {
  const rect = getSelectionRect();
  if (!rect) {
    return { display: 'none' };
  }
  
  return {
    position: 'fixed',
    left: rect.x + 'px',
    top: rect.y + 'px',
    width: rect.width + 'px',
    height: rect.height + 'px',
    //border: '2px dashed #007bff',
    //backgroundColor: 'rgba(0, 123, 255, 0.1)',
    border: '3px dashed purple',
    backgroundColor: 'rgba(255,0,255,0.1)',
    pointerEvents: 'none',
    zIndex: 1000
  };
});

function getMainStyleObject() {
  return gApp.site.getMainStyleObject();
}

onMounted(() => {
  installKeyHandlers();
  
  // Get the main/editor element and install mouse handlers on it
  const mainElement = document.getElementById('Main');
  installMouseHandlers(mainElement);

  window.addEventListener("resize", onPageResize);
  onPageResize();
  
  // Set up watcher for custom CSS
  setupCustomCssWatcher();
})

onUnmounted(() => {
  removeKeyHandlers();
  removeMouseHandlers();

  window.removeEventListener("resize", onPageResize);
  
  // Clean up custom CSS
  removeCustomCssStyleTag();
})

</script>

<template>  
  <router-view></router-view>
  <main id="Main" @click="onClickBackground" :style="{...getMainStyleObject(), cursor: mainCursor}">
    <ShortcutBtns />
    <div id="CanvasArea">
      <div class="AnchorDiv">
        <NodeWidget id="RootNode" :node="rootNode" />
      </div>
      <div v-if="isEditing && gApp.site.settings.showDesignGuide" class="DesignAreaGuide">
      </div>
      <!--
      <div v-if="isEditing" class="CenterIndicator">
        <i class="bi bi-plus-lg"></i>
      </div>
      -->
    </div>
    <!-- Selection rectangle overlay -->
    <div v-if="getSelectionRect()" class="SelectionRect" :style="selectionRectStyle"></div>
  </main>
</template>

<style scoped>
.DesignAreaGuide {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--design-width);
  height: var(--design-height);
  transform: translate(-50%, -50%);
  border: 2px dashed var(--design-guide-color);
  border-radius: var(--border-radius-large);
  pointer-events: none;
  z-index: -1;
}

.CenterIndicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 50px;
  color: var(--design-guide-color);
  pointer-events: none;
  z-index: -1;
}
</style>
