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
      insertIndex = Math.max(0, selectedNode.getIndexInParent() - 1);
    }
  } else {
    parentNode = nodeTree.root;
  }

  let newNode = reactive(new (nodeOption.classCtor)());
  newNode.onCreate();
  parentNode.addChildAtIndex(newNode, insertIndex);
  gApp.site.selectNode(newNode);
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
    
    // Prevent dropping a node onto itself or its descendants
    if (draggedNode === targetNode || targetNode.isDescendantOf(draggedNode)) {
      console.log('Invalid drop: cannot drop node onto yourself or into yourself');
      resetDragState();
      return;
    }

    // If we drag onto the root node, just make it the first child in the list - likely
    // what the user wants.
    if (targetNode === nodeTree.root) {
      draggedNode.removeFromParent();
      nodeTree.root.addChild(draggedNode);
      resetDragState();
      return;
    }
    
    // Remove the dragged node from its current parent
    draggedNode.removeFromParent();
    console.log(`Dropping ${draggedNode.name} ${position} ${targetNode.name}`);
    if (position === 'inside' && targetNode.allowsChildren) {
      // Add as first child
      targetNode.addChild(draggedNode);
    } else if (position === 'before') {
      const parentNode = targetNode.parentNode;
      const targetIndex = targetNode.getIndexInParent();
      parentNode.addChildAtIndex(draggedNode, targetIndex);
    } else if (position === 'after') {
      const parentNode = targetNode.parentNode;
      const targetIndex = targetNode.getIndexInParent();
      parentNode.addChildAtIndex(draggedNode, targetIndex + 1);
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
    //console.log("Node in tree: " + node.name + " at depth " + depth);
    nodes.push({node: node, depth: depth});
    return node.openInNodeTree;
  });
  return nodes;
})

</script>

<template>
  <div>
    <div class="ButtonPane">
      <button class="TertiaryButton NewButton" @click="makeNewNode"><i class="bi bi-plus-square"></i></button>
      <!--<button class="TertiaryButton" @click="cloneNode">Clone</button>-->
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
.ButtonPane {
  display: flex;
  flex-flow: row nowrap;
  padding-bottom: var(--space-xxs);
  width: 100%;
}

.ButtonPane button {
  margin-right: 2px;
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

<style>
.TreeInner {
}

.item {
  /*cursor: pointer;*/
  line-height: 1.5;
}

</style>
