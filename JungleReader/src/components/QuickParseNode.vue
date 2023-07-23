<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'

const props = defineProps({
  nodeData: Object,
  childNum: Number,
  numChildren: Number,
})

const emit = defineEmits(['editFeed'])

let isExpanded = ref(true);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function attrWeight(attrName) {
  if (attrName === "id") {
    return 0;
  } else if (attrName === "href") {
    return 1;
  } else if (attrName === "class") {
    return 2;
  }
  return 3;
}

function getAttrStr(nodeData) {
  let attrStr = "";
  if ('href' in nodeData.attrs) {
    let hrefVal = nodeData.attrs.href;
    return ` href="${hrefVal}"`;    
  }
  return attrStr;
}

/*
// All this info makes it hard to skim through the html tree to find your stuff.
function getAttrStr(nodeData) {
  if (nodeData.attrs.length === 0) {
    return "";
  }
  let attrArr = []
  for (let key in nodeData.attrs) {
    attrArr.push({key: key, value: nodeData.attrs[key]});
  }
  // Sort most important attributes first
  attrArr.sort(function (a, b) {
    return attrWeight(b.key) - attrWeight(a.key);
  });
  console.log(attrArr);

  let attrStr = " ";
  for (let i = 0; i < attrArr.length; ++i) {
    let item = attrArr[i];
    attrStr += `${item.key}=\"${item.value}\"`
    if (i + 1 < attrStr.length) {
      attrStr += " ";
    }
  }
  return attrStr;
}
*/

/*
function toggleExpandFeed(feed) {
  feed.expanded = !feed.expanded;
}

function onFeedClicked(feed) {
  toggleExpandFeed(feed);
  gApp.feedReader.setSelectedFeed(feed);
}

function selectFeed(feed) {
  gApp.feedReader.setSelectedItem(feed);
}
*/

</script>

<template>
  <div class="QuickParseNode">
    <div class="Flex">
      <TreeIcon v-if="nodeData.children.length > 0" :expanded="isExpanded" @click="toggleExpanded" />
      <template v-if="nodeData.type == 'text'">
        <p>text: "{{ nodeData.value }}"</p>
      </template>
      <template v-else>
        <p>&lt;{{ nodeData.name.toLowerCase() }}{{ getAttrStr(nodeData) }}&gt;</p>
      </template>
    </div>
    <template v-if="nodeData.children.length > 0">
      <ul class="ChildList" v-if="isExpanded">
        <li v-for="childData in nodeData.children">
          <QuickParseNode :nodeData="childData" />
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.QuickParseNode {
  line-height: 1.25;
}

.ChildList {
  list-style-type: none;
  padding-left: 20px;
}
</style>
