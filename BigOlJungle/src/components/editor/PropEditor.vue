<script setup>
import { ref, onMounted } from 'vue'
import { gApp, Node } from './State.js'
import { kEditorMap } from './widgets/Widgets.js'
import EditorPane from './EditorPane.vue'

let propEditor = gApp.site.getPropEditor();

</script>

<template>
  <EditorPane v-if="propEditor" paneTitle="Properties" :startX="800" :startY="100">
    <p>Type: {{ propEditor.componentName }}</p>
    <component :is="kEditorMap[propEditor.componentName]" :editorData="propEditor"></component>
  </EditorPane>
</template>

<style scoped>
</style>
