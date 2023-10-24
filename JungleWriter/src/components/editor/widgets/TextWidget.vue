<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { TextNode } from './TextNode.js'

const props = defineProps({
  node: Object
})

function onClick() {
  gApp.site.selectNode(props.node);
}

let elementRef = ref(null);

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <div class="Widget TextWidget" :style="node.getStyleObject()" ref="elementRef" @click="onClick">{{ node.text }}</div>
</template>

<style scoped>
</style>

<style>
.TextWidget {
  white-space: pre;
}
</style>

