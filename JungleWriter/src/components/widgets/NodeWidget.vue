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

</script>

<template>
  <div class="Widget NodeWidget" ref="elementRef" :style="styleObject">
    <!-- Use a separate indicator for the drag handle so that we can display it on top 
     without messing up the node hierarchy. -->
    <div class="GroupIndicator" ref="groupIndicatorRef" ></div>
    <svg class="arrow" width="40" height="20" viewBox="0 0 40 20">
      <polygon points="0,0 30,10 0,20" fill="currentColor" />
    </svg>
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
  /*
  width: 20px;
  height: 20px;
  */
  border: 2px solid black;
  border-right: none;
  border-bottom: none;

  width: 200px;
  height: 200px;
  background-image: url('../../assets/Axis.png');
  background-repeat: no-repeat;
  
  /* Move the background so its center aligns with top-left */
  background-position: left top; /* sets reference point */
  
  /* Adjust using calc() to shift the image by half its size */
  background-position: calc(0% + 50%) calc(0% + 50%);
}

.arrow {
  color: red;
}
</style>

<style>
</style>

