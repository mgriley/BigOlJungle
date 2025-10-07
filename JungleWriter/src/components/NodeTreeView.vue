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
  let selNode = gApp.site.getPrimarySelection();
  if (selNode && !selNode.isRoot()) {
    let clonedNode = selNode.cloneAndAddAsSibling();
    gApp.site.selectNode(clonedNode);
  }
}

function moveNodeUp() {
  let selNode = gApp.site.getPrimarySelection();
  if (selNode) {
    selNode.moveUp();
  }
}

function moveNodeDown() {
  let selNode = gApp.site.getPrimarySelection();
  if (selNode) {
    selNode.moveDown();
  }
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
  const selectedNodes = gApp.site.getSelectedItems();
  if (selectedNodes.length < 1) {
    return;
  }
  
  // Filter out root nodes (can't be grouped)
  const groupableNodes = selectedNodes.filter(node => !node.isRoot());
  if (groupableNodes.length < 1) {
    return;
  }
  
  // Create a new group node
  const groupNode = gApp.site.createNode(gNodeDataMap["Node"].nodeClass);
  groupNode.name = "Group";
  
  // Find the common parent and get the first node's position
  const firstNode = groupableNodes[0];
  const parentNode = firstNode.parentNode;
  const firstNodeIndex = firstNode.getIndexInParent();
  const firstNodeGlobalPos = firstNode.getGlobalPos();
  
  // Add the group to the parent at the first node's index
  parentNode.addChildAtIndex(groupNode, firstNodeIndex);
  groupNode.setGlobalPos(firstNodeGlobalPos);
  
  // Move all selected nodes into the group, adjusting their positions
  for (const node of groupableNodes) {
    const globalPos = node.getGlobalPos();
    node.moveToNode(groupNode);
    node.setGlobalPos(globalPos);
  }
  
  // Select the new group
  gApp.site.selectNode(groupNode);
}

function ungroupNodes() {
  const selectedNodes = gApp.site.getSelectedItems();
  if (selectedNodes.length !== 1) {
    return; // Need exactly one node selected
  }
  
  const groupNode = selectedNodes[0];
  if (groupNode.isRoot() || groupNode.children.length === 0) {
    return; // Can't ungroup root or empty nodes
  }
  
  const parentNode = groupNode.parentNode;
  if (!parentNode) {
    return; // Can't ungroup root
  }
  
  // Get the group's position in the parent
  const groupIndex = groupNode.getIndexInParent();
  
  // Store the children before we start moving them
  const childrenToMove = [...groupNode.children];
  
  // Move all children to the group's parent at the group's position, preserving global positions
  for (let i = 0; i < childrenToMove.length; i++) {
    const child = childrenToMove[i];
    const globalPos = child.getGlobalPos();
    child.moveToNode(parentNode, groupIndex + i);
    child.setGlobalPos(globalPos);
  }
  
  // Remove the now-empty group
  groupNode.destroy();
  
  // Select the ungrouped nodes
  gApp.site.selectMany(childrenToMove);
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
      <button class="TertiaryButton NewButton" @click="makeNewNode"><i class="bi bi-plus-square"></i></button>
      <button class="TertiaryButton" @click="cloneNode"><i class="bi bi-copy"></i></button>
      <button class="TertiaryButton" @click="groupNodes"><i class="bi bi-collection"></i></button>
      <button class="TertiaryButton" @click="ungroupNodes"><i class="bi bi-box-arrow-up"></i></button>
      <button class="TertiaryButton" @click="moveNodeUp"><i class="bi bi-arrow-up-square"></i></button>
      <button class="TertiaryButton" @click="moveNodeDown"><i class="bi bi-arrow-down-square"></i></button>
      <button id="DeleteLayerBtn" class="DeleteBtn TertiaryButton" @click="deleteNode"><i class="bi bi-trash3"></i></button>
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

</style>
