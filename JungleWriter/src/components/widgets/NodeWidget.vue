<script>
//import * as State from '../State.js'
</script>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gNodeDataMap } from './NodeDataMap.js'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../DragUtils.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);
let groupIndicatorRef = ref(null);

onMounted(() => {
  // Note - we don't allow dragging the root node
  if (!props.node.isRoot()) {
    setupWidgetDrag(groupIndicatorRef.value, props.node);
  }
})

let styleObject = computed(() => {
  let baseStyle = props.node.getStyleObject();
  let curStyle = {
    width: '0px',
    height: '0px',
    // Reset the outline, which may be set to red for selected nodes
    outline: 'none',
  }
  return {
    ...baseStyle,
    ...curStyle
  }
})

</script>

<template>
  <div class="Widget NodeWidget" ref="elementRef" :style="styleObject">
    <!-- Use a separate indicator for the drag handle so that we can display it on top 
     without messing up the node hierarchy. -->
    <img
      v-show="node.isSelected()"
      ref="groupIndicatorRef"
      src="../../assets/Axis.png"
      alt="Axis"
      class="AxisImage" />
    <template v-for="childNode in node.getChildrenInHtmlOrder()" :key="childNode.id">
      <component v-if="childNode.type !== null" :is="gNodeDataMap[childNode.type].widget" :node="childNode" />
    </template>
  </div>
</template>

<style scoped>
.AxisImage {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 150px;
  height: 150px;
  transform: translate(-50%, -50%);
}
</style>

<style>
</style>

