<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, Node } from './State.js'
import { kEditorMap } from './widgets/Widgets.js'
import EditorPane from './EditorPane.vue'

let propEditor = gApp.site.getPropEditor();

/*
let editorComponent = computed(() => {
  let propEditor = gApp.site.getPropEditor();
  if (!propEditor.value) {
    return null;
  }
  let component = kEditorMap[propEditor.value.componentName];
  if (!component) {
    return null;
  }
  return component;
})
*/

</script>

<template>
  <EditorPane v-if="propEditor" paneTitle="Properties" :startX="800" :startY="100">
    <p>Type: {{ propEditor.componentName }}</p>
    <component v-if="kEditorMap[propEditor.componentName]" :is="kEditorMap[propEditor.componentName]" :editorData="propEditor"></component>
  </EditorPane>
</template>

<style scoped>
</style>
