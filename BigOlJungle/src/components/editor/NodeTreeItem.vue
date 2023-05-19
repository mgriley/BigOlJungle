<script setup>
import { ref, computed } from 'vue'
import { gApp } from './State.js'

const props = defineProps({
  node: Object,
  depth: Number,
})

const isFolder = computed(() => {
  return props.node.children && props.node.children.length
})

let isOpen = computed(() => {
  return props.node.openInNodeTree;
})

function toggleOpen() {
  props.node.openInNodeTree = !props.node.openInNodeTree;
}

function selectNode() {
  gApp.site.selectNode(props.node);    
}

function onDoubleClick() {
}

let depthText = computed(() => {
  return '-'.repeat(props.depth) + ' ';
})

let styleObject = computed(() => {
  let obj = {};
  if (props.node.isSelected()) {
    obj.background = "lightblue";
  }
  return obj;
})

</script>

<template>
  <div :class="{ bold: isFolder, ItemContainer: true }" :style="styleObject" @click="selectNode">
    <span class="DepthSpan">{{depthText}}</span>
    <span @dblclick="onDoubleClick">
    {{ props.node.name }}
    </span>
    <span class="OpenBtn" v-if="isFolder" @click="toggleOpen">[{{ isOpen ? '-' : '+' }}]</span>
  </div>
</template>

<style scoped>
.OpenBtn {
  margin-left: 5px;
  margin-right: 5px;
}

.ItemContainer {
  padding: 0px 10px;
}
</style>

