<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, Node } from './State.js'
import NodeTreeItem from './NodeTreeItem.vue'
import EditorPane from './EditorPane.vue'
import TextWidget, { TextNode } from './widgets/TextWidget.vue'

// See: https://vuejs.org/examples/#tree

const nodeTree = gApp.site.nodeTree

const treeViewRef = ref(null)

function addNode() {
  let rootNode = nodeTree.root
  let newNode = new TextNode();
  rootNode.addChild(newNode);
}

function deleteNode() {
  gApp.site.deleteSelectedNodes();
}

/*
let nodeList = computed(() => {
  return nodeTree.root.getChildrenDfs();
})
*/

let nodeList = computed(() => {
  let nodes = [];
  nodeTree.root.iterateChildrenDfs((node, depth) => {
    nodes.push({node: node, depth: depth});
    return node.openInNodeTree;
  });
  return nodes;
})

</script>

<template>
  <EditorPane paneTitle="Nodes" :startX="100" :startY="100">
    <div class="ButtonPane">
      <button @click="addNode">New</button>
      <button @click="deleteNode">Delete</button>
    </div>
    <div class="treeInner"> 
      <template v-for="childNode in nodeList" :id="child.node.id">
        <NodeTreeItem class="item" :node="childNode.node" :depth="childNode.depth"></NodeTreeItem>
      </template>
    </div>
  </EditorPane>
</template>

<style scoped>
.ButtonPane {
  display: inline-block;
  /*background: blue;*/
  padding: 10px 5px;
}
</style>

<style>
.treeInner {
  /*padding: 20px 5px;*/
}

.item {
  cursor: pointer;
  line-height: 1.5;
}

.bold {
  font-weight: bold;
}

</style>
