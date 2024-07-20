<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { gApp, Node } from './State.js'
import NodeTreeItem from './NodeTreeItem.vue'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import ModalSelector from './ModalSelector.vue'

// See: https://vuejs.org/examples/#tree

const nodeTree = gApp.site.nodeTree;

const treeViewRef = ref(null);
const newNodeModal = ref(null);

let newNodeOptions = [
{
  name: "Group",
  classCtor: gNodeDataMap["Node"].nodeClass,
},
{
  name: "Text",
  classCtor: gNodeDataMap["TextNode"].nodeClass,
},
{
  name: "Image",
  classCtor: gNodeDataMap["ImageNode"].nodeClass,
},
{
  name: "Rect",
  classCtor: gNodeDataMap["RectNode"].nodeClass,
},
/*
{
  name: "Omni",
  classCtor: gNodeDataMap["OmniNode"].nodeClass,
},
 */
/*
{
  name: "Links",
  classCtor: gNodeDataMap["LinksNode"].nodeClass,
},
 */
];

function makeNewNode(clickEvt) {
  newNodeModal.value.toggleModal(clickEvt);
}

function cloneNode() {
  // TODO
}

function moveNodeUp() {
  let selNode = gApp.site.getSelectedNode();
  if (selNode) {
    selNode.moveUp();
  }
}

function moveNodeDown() {
  let selNode = gApp.site.getSelectedNode();
  if (selNode) {
    selNode.moveDown();
  }
}

function onChooseNewNode(nodeOption) {
  let parentNode = null;
  let insertIndex = null;
  let selectedNode = gApp.site.getSelectedNode();
  if (selectedNode) {
    if (selectedNode.allowsChildren) {
      parentNode = selectedNode;
    } else {
      parentNode = selectedNode.parentNode;
      insertIndex = selectedNode.getIndexInParent() + 1;
    }
  } else {
    parentNode = nodeTree.root;
  }

  let newNode = reactive(new (nodeOption.classCtor)());
  newNode.onCreate();
  parentNode.addChildAtIndex(newNode, insertIndex);
  /*gApp.site.selectNode(newNode);*/
}

function deleteNode() {
  gApp.site.deleteSelectedNodes();
}

function moveNode(nodeA, nodeB) {
  nodeA.moveNode(nodeB);
}

/*
let nodeList = computed(() => {
  return nodeTree.root.getChildrenDfs();
})
*/

// TODO - this is probably not good for vue perf. Use recursive Comp
// method instead, but without nesting the divs.
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
  <div>
    <div class="ButtonPane">
      <button class="TertiaryButton NewButton" @click="makeNewNode">New</button>
      <button class="TertiaryButton" @click="cloneNode">Clone</button>
      <button class="TertiaryButton" @click="moveNodeUp">MoveUp</button>
      <button class="TertiaryButton" @click="moveNodeDown">MoveDown</button>
      <button class="DeleteBtn TertiaryButton" @click="deleteNode">Delete</button>
      <ModalSelector ref="newNodeModal" :options="newNodeOptions" @choose="onChooseNewNode"/>
    </div>
    <div class="TreeInner"> 
      <template v-for="childNode in nodeList" :id="child.node.id">
        <NodeTreeItem class="item" :node="childNode.node" :depth="childNode.depth"></NodeTreeItem>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ButtonPane {
  display: inline-block;
  padding-bottom: var(--space-xxs);
}

.ButtonPane button {
  margin-right: var(--space-xxs);
}

.ButtonPane .NewButton {
  margin-right: var(--space-m);
}

.DeleteBtn {
  /*float: right;*/
}
</style>

<style>
.TreeInner {
}

.item {
  /*cursor: pointer;*/
  line-height: 1.5;
}

</style>
