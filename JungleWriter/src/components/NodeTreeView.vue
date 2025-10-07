<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { gApp, } from './State.js'
import NodeTreeItem from './NodeTreeItem.vue'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import ModalSelector from './ModalSelector.vue'

// See: https://vuejs.org/examples/#tree

const nodeTree = gApp.site.nodeTree;

const treeViewRef = ref(null);
const newNodeModal = ref(null);

// Drag and drop state
const dragState = reactive({
  isDragging: false,
  draggedNode: null,
  dropTarget: null,
  dropPosition: null, // 'before', 'after', 'inside'
});

let newNodeOptions = [
{
  name: "Group",
  icon: "bi bi-folder",
  classCtor: gNodeDataMap["Node"].nodeClass,
},
{
  name: "Text",
  icon: "bi bi-type",
  classCtor: gNodeDataMap["TextNode"].nodeClass,
},
{
  name: "Image",
  icon: "bi bi-image",
  classCtor: gNodeDataMap["ImageNode"].nodeClass,
},
{
  name: "Rect",
  icon: "bi bi-app",
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
  gApp.site.cloneSelected();
}

function moveNodeUp() {
  gApp.site.moveUpSelected();
}

function moveNodeDown() {
  gApp.site.moveDownSelected();
}

function onChooseNewNode(nodeOption) {
  let parentNode = null;
  let insertIndex = null;
  /*
  let selectedNode = gApp.site.getPrimarySelection();
  if (selectedNode && selectedNode.getAllowsChildren()) {
    parentNode = selectedNode;
  } else {
    parentNode = nodeTree.root;
  }
  */
  parentNode = nodeTree.root;

  console.log("Creating node...");
  let newNode = gApp.site.createNode(nodeOption.classCtor);
  parentNode.addChildAtIndex(newNode, insertIndex);
  let centerPos = gApp.site.getCenterPosWrtRoot();
  newNode.setCenterPos(centerPos);
  gApp.site.selectNode(newNode);
}

function groupNodes() {
  gApp.site.groupSelected();
}

function ungroupNodes() {
  gApp.site.ungroupSelected();
}

function deleteNode() {
  gApp.site.deleteSelectedNodes();
}

function onDragStart(node) {
  dragState.isDragging = true;
  dragState.draggedNode = node;
  console.log('Drag started for node:', node.name);
}

function onDragOver(targetNode, position) {
  if (dragState.isDragging && dragState.draggedNode !== targetNode) {
    dragState.dropTarget = targetNode;
    dragState.dropPosition = position;
  }
}

function onDragEnd() {
  if (dragState.isDragging && dragState.dropTarget && dragState.draggedNode) {
    const draggedNode = dragState.draggedNode;
    const targetNode = dragState.dropTarget;
    const position = dragState.dropPosition;
    
    // Prevent dropping a node onto itself or into itself
    if (draggedNode === targetNode || targetNode.isDescendantOf(draggedNode)) {
      console.log('Invalid drop: cannot drop node onto yourself or into yourself');
      resetDragState();
      return;
    }

    // If we drag onto the root node, just make it the first child in the list - likely
    // what the user wants.
    if (targetNode === nodeTree.root) {
      draggedNode.moveToNode(nodeTree.root);
      resetDragState();
      return;
    }
    
    // Remove the dragged node from its current parent
    console.log(`Dropping ${draggedNode.name} ${position} ${targetNode.name}`);
    if (position === 'inside' && targetNode.getAllowsChildren()) {
      // Add as first child
      draggedNode.moveToNode(targetNode);
    } else if (position === 'before') {
      const parentNode = targetNode.parentNode;
      const targetIndex = targetNode.getIndexInParent();
      draggedNode.moveToNode(parentNode, targetIndex);
    } else if (position === 'after') {
      const parentNode = targetNode.parentNode;
      const targetIndex = targetNode.getIndexInParent();
      draggedNode.moveToNode(parentNode, targetIndex + 1);
    }
  }
  
  resetDragState();
}

function resetDragState() {
  dragState.isDragging = false;
  dragState.draggedNode = null;
  dragState.dropTarget = null;
  dragState.dropPosition = null;
}

function onDropEnd() {
  // This handles the case where drag ends without a successful drop
  console.log('Drag operation ended');
  resetDragState();
}

// TODO - this is probably not good for vue perf. Use recursive Comp
// method instead, but without nesting the divs.
let nodeList = computed(() => {
  let nodes = [];
  nodeTree.root.iterateChildrenDfs((node, depth) => {
    //console.log("Node in tree: " + node.name + " at depth " + depth);
    nodes.push({node: node, depth: depth});
    return node.openInNodeTree;
  });
  return nodes;
})

</script>

<template>
  <div class="NodeTreeView">
    <div class="ButtonPane">
      <button class="NodeTreeButton NewButton" @click="makeNewNode" title="Add new node">➕</button>
      <button class="NodeTreeButton" @click="cloneNode" title="Duplicate selected nodes">🐑</button>
      <button class="NodeTreeButton" @click="groupNodes" title="Group selected nodes">📦</button>
      <button class="NodeTreeButton" @click="ungroupNodes" title="Ungroup selected group">📤</button>
      <button class="NodeTreeButton" @click="moveNodeUp" title="Move selected nodes up">⬆️</button>
      <button class="NodeTreeButton" @click="moveNodeDown" title="Move selected nodes down">⬇️</button>
      <button id="DeleteLayerBtn" class="DeleteBtn NodeTreeButton" @click="deleteNode" title="Delete selected nodes">🗑️</button>
      <ModalSelector ref="newNodeModal" :options="newNodeOptions" @choose="onChooseNewNode"/>
    </div>
    <div class="TreeInner"> 
      <template v-for="childNode in nodeList" :id="child.node.id">
        <NodeTreeItem 
          class="item" 
          :node="childNode.node" 
          :depth="childNode.depth"
          :dragState="dragState"
          @dragStart="onDragStart"
          @dragOver="onDragOver"
          @dragEnd="onDragEnd"
          @dropEnd="onDropEnd"
        ></NodeTreeItem>
      </template>
    </div>
  </div>
</template>

<style scoped>
.NodeTreeView {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.TreeInner {
  overflow: auto;
  scrollbar-width: thin;
  flex: 1;
}

.item {
  /*cursor: pointer;*/
  line-height: 1.5;
}

.ButtonPane {
  display: flex;
  flex-flow: row nowrap;
  padding-bottom: var(--space-xxs);
  width: 100%;
}

.ButtonPane button {
  margin-right: 2px;
  font-size: var(--f-l) !important;
}

.ButtonPane .NewButton {
  margin-right: var(--space-s);
}

.DeleteBtn {
  /*float: right;*/
}

#DeleteLayerBtn {
  /*margin-left: var(--space-xs);*/
  margin-left: auto;
}

.NodeTreeButton {
  color: white;
  border: none;
  padding: 2px 4px;
  min-width: 0px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.NodeTreeButton:hover {
  background-color: #0056b3;
}

.NodeTreeButton:active {
  background-color: #004085;
}

</style>
