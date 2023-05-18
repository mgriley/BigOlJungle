<script setup>
import { ref, computed } from 'vue'
import { gApp } from './State.js'

const props = defineProps({
  model: Object
})

const isOpen = ref(false)
const isFolder = computed(() => {
  return props.model.children && props.model.children.length
})

function toggleOpen() {
  isOpen.value = !isOpen.value
}

function selectNode() {
  gApp.site.selectNode(props.model);    
}

function onDoubleClick() {
}

</script>

<template>
  <li>
    <div :class="{ bold: isFolder }">
      <span @click="selectNode" @dblclick="onDoubleClick">
      {{ model.name }}
      </span>
      <span v-if="isFolder" @click="toggleOpen">[{{ isOpen ? '-' : '+' }}]</span>
    </div>
    <ul v-show="isOpen" v-if="isFolder">
      <!--
        A component can recursively render itself using its
        "name" option (inferred from filename if using SFC)
      -->
      <NodeTreeItem
        class="item"
        v-for="model in model.children"
        :model="model">
      </NodeTreeItem>
    </ul>
  </li>
</template>
