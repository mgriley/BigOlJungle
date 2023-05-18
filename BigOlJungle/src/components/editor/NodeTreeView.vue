<script setup>
import { ref, onMounted } from 'vue'
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

</script>

<template>
  <EditorPane paneTitle="Nodes" :startX="100" :startY="100">
    <div class="treeInner"> 
      <ul>
        <NodeTreeItem class="item" :model="nodeTree.root"></NodeTreeItem>
      </ul>
      <button @click="addNode()">Add Item</button>
    </div>
  </EditorPane>
</template>

<style>
.item {
  cursor: pointer;
  line-height: 1.5;
}

.bold {
  font-weight: bold;
}

</style>
