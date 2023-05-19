<script>
//import * as State from '../State.js'
</script>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { kWidgetMap } from './Widgets.js'
import { gApp } from '../State.js'
import { setupWidget } from '../Utils.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);

onMounted(() => {
  // TODO
  /*setupWidget(elementRef.value, props.node);*/
})

</script>

<template>
  <div class="Widget NodeWidget" ref="elementRef">
    <template v-for="childNode in node.children" :key="childNode.id">
      <component v-if="childNode.componentName !== null" :is="kWidgetMap[childNode.componentName]" :node="childNode" />
    </template>
  </div>
</template>

<style scoped>
</style>

<style>
.NodeWidget {
  position: absolute;  
  width: 0px;
  height: 0px;
}
</style>

