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
  <div class="Widget ImageWidget" :style="node.getStyleObject()" ref="elementRef" @click="onClick">
    <img :src="node.getSrcUrl()" alt="node.altText" />
  </div>
</template>

<style scoped>
</style>

<style>
.ImageWidget {
}
</style>

