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
let groupIndicatorRef = ref(null);

onMounted(() => {
  setupWidgetDrag(groupIndicatorRef.value, props.node);
})

let styleObject = computed(() => {
  let baseStyle = props.node.getStyleObject();
  let curStyle = {
    width: '0px',
    height: '0px',
    // Reset the outline, which may be set to red for selected nodes
    outline: 'none',
  }
  /*
  if (props.node.isSelected()) {
    let boxLen = 30;
    curStyle.width = boxLen+'px';
    curStyle.height = boxLen+'px';
    curStyle.outline = "2px solid black";
  }
  */
  return {
    ...baseStyle,
    ...curStyle
  }
})

let groupIndicatorObject = computed(() => {
  let style = {
    width: '0px',
    height: '0px',
  }
  if (props.node.isSelected()) {
    let boxLen = 30;
    style.width = boxLen+'px';
    style.height = boxLen+'px';
    style.outline = "2px solid black";
  }
  return style;
})

</script>

<template>
  <div class="Widget NodeWidget" ref="elementRef" :style="styleObject">
    <!-- Use a separate indicator for the drag handle so that we can display it on top 
     without messing up the node hierarchy. -->
    <div class="GroupIndicator" ref="groupIndicatorRef" :style="groupIndicatorObject" ></div>
    <template v-for="childNode in node.getChildrenInHtmlOrder()" :key="childNode.id">
      <component v-if="childNode.type !== null" :is="gNodeDataMap[childNode.type].widget" :node="childNode" />
    </template>
  </div>
</template>

<style scoped>
.GroupIndicator {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
}
</style>

<style>
</style>

