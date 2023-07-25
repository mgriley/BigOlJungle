<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'
import TextTreeIcon from './TextTreeIcon.vue'

const props = defineProps({
  nodeData: Object,
  childNum: Number,
  numChildren: Number,
})

const emit = defineEmits(['selectNode'])

let isExpanded = ref(true);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function onSelectChildNode(childNode) {
  emit('selectNode', childNode)  
}

// All this info makes it hard to skim through the html tree to find your stuff.
function getAttrStr(nodeData) {
  // Only display some attributes, to prevent clogging up the html viewer
  let visibleAttrs = {
    'class': 0,
    'id': 1,
    'href': 2,
  };
  let attrArr = []
  for (let key in nodeData.attrs) {
    if (key in visibleAttrs) {
      attrArr.push({key: key, value: nodeData.attrs[key], weight: visibleAttrs[key]});
    }
  }
  if (attrArr.length === 0) {
    return "";
  }
  // Sort most important attributes first
  attrArr.sort(function (a, b) {
    return b.weight - a.weight;
  });

  let attrStr = " ";
  for (let i = 0; i < attrArr.length; ++i) {
    let item = attrArr[i];
    attrStr += `${item.key}=\"${item.value}\"`
    if (i + 1 < attrArr.length) {
      attrStr += " ";
    }
  }
  return attrStr;
}

</script>

<template>
  <div class="QuickParseNode">
    <div class="Flex">
      <TreeIcon :style="{visibility: nodeData.children.length > 0 ? 'visible' : 'hidden'}" :expanded="isExpanded" @click="toggleExpanded" />
      <div class="Flex">
        <div class="ParseNodeTitle TextButton Flex" :class="{ChosenParseNode: nodeData.isChosen}" @click="emit('selectNode', nodeData)">
          <template v-if="nodeData.type == 'text'">
            <p>text: "{{ nodeData.value }}"</p>
          </template>
          <template v-else>
            <p>&lt;{{ nodeData.name.toLowerCase() }}{{ getAttrStr(nodeData) }}&gt;</p>
          </template>
        </div>
        <p v-if="nodeData.helperText" class="HelperText">({{ nodeData.helperText }})</p>
      </div>
    </div>
    <template v-if="nodeData.children.length > 0">
      <ul class="ChildList" v-if="isExpanded">
        <li v-for="childData in nodeData.children">
          <QuickParseNode :nodeData="childData" @selectNode="onSelectChildNode" />
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.QuickParseNode {
  line-height: 1.25;
  font-family: monospace;
}

.ParseNodeTitle:hover {
  background-color: lightblue;      
}

.ChosenParseNode {
  background-color: orange;
}

.ChildList {
  list-style-type: none;
  padding-left: 20px;
}

.HelperText {
  margin-left: 5px;
}
</style>
