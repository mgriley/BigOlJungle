<script>
//import * as State from '../State.js'
</script>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gNodeDataMap } from './NodeDataMap.js'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

let styleObject = computed(() => {
  let baseStyle = props.node.getStyleObject();
  let curStyle = {
    width: '0px',
    height: '0px',
  }
  if (props.node.isSelected()) {
    let boxLen = 30;
    curStyle.width = boxLen+'px';
    curStyle.height = boxLen+'px';
    /*curStyle.background = 'black';*/
    curStyle.outline = "2px solid black";
  }
  return {
    ...baseStyle,
    ...curStyle
  }
})

</script>

<template>
  <div class="Widget NodeWidget" ref="elementRef" :style="styleObject">
    <template v-for="childNode in node.children" :key="childNode.id">
      <component v-if="childNode.type !== null" :is="gNodeDataMap[childNode.type].widget" :node="childNode" />
    </template>
  </div>
</template>

<style scoped>
</style>

<style>
.NodeWidget {
  /* position: absolute;   */
  width: 0px;
  height: 0px;
}
</style>

