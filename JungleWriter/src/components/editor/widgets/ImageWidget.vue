<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidget } from '../Utils.js'
import { ImageNode } from './ImageNode.js'

const props = defineProps({
  node: Object
})

function onClick() {
  gApp.site.selectNode(props.node);
}

let elementRef = ref(null);

onMounted(() => {
  setupWidget(elementRef.value, props.node);
})

</script>

<template>
  <img class="Widget ImageWidget"
       :style="node.getStyleObject()"
       ref="elementRef" @click="onClick"
       :src="node.getSrcUrl()" :alt="node.altText" />
</template>

<style scoped>
</style>

<style>
.ImageWidget {
  background-color: lightblue;
}
</style>

