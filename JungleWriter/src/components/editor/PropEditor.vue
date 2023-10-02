<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, Node } from './State.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import EditorPane from './EditorPane.vue'

let propEditor = computed(() => {
  return gApp.site.getPropEditor();
});

/*
let editorComponent = computed(() => {
  let propEditor = gApp.site.getPropEditor();
  if (!propEditor.value) {
    return null;
  }
  let component = kEditorMap[propEditor.value.type];
  if (!component) {
    return null;
  }
  return component;
})
*/

onMounted(() => {
  console.log("gNodeDataMap:", gNodeDataMap);
})

</script>

<template>
  <EditorPane paneTitle="Properties" :startX="800" :startY="100">
    <template v-if="propEditor">
      <p class="MarginBotXS">Type: {{ propEditor.type }}</p>
      <component v-if="gNodeDataMap[propEditor.type].editor" :is="gNodeDataMap[propEditor.type].editor" :editorData="propEditor"></component>
    </template>
    <template v-else>
      <p>None</p>
    </template>
  </EditorPane>
</template>

<style>
</style>

<style scoped>
</style>
