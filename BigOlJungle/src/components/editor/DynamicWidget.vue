<script>
</script>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidget } from '../Utils.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);

onMounted(() => {
  setupWidget(elementRef.value, props.node);
})

</script>

<template>
  <component v-if="node.componentName !== null" :is="kWidgetMap[node.componentName]" :node="node" />
  <div class="NodeWidget">
    <template v-for="childNode in node.children">
      <component v-if="childNode.componentName !== null" :is="kWidgetMap[childNode.componentName]" :node="node" />
    </template>
  </div>
</template>

<style scoped>
</style>

