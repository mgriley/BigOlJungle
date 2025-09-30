<script setup>
import { gApp } from './State.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'

const nodeCreationOptions = [
  {
    name: "Group",
    icon: "bi bi-folder",
    color: "#4CAF50",
    classCtor: gNodeDataMap["Node"].nodeClass,
  },
  {
    name: "Rect",
    icon: "bi bi-app",
    color: "#2196F3",
    classCtor: gNodeDataMap["RectNode"].nodeClass,
  },
  {
    name: "Text",
    icon: "bi bi-type",
    color: "#FF9800",
    classCtor: gNodeDataMap["TextNode"].nodeClass,
  },
  {
    name: "Image",
    icon: "bi bi-image",
    color: "#9C27B0",
    classCtor: gNodeDataMap["ImageNode"].nodeClass,
  },
];

function createNode(nodeOption) {
  const parentNode = gApp.site.nodeTree.root;
  const newNode = gApp.site.createNode(nodeOption.classCtor);
  parentNode.addChildAtIndex(newNode, null);
  
  // Position the new node at the center of the current view
  const centerPos = gApp.site.getCenterPosWrtRoot();
  newNode.setCenterPos(centerPos);
  
  // Select the newly created node
  gApp.site.selectNode(newNode);
}
</script>

<template>
  <div class="TopMenu">
    <div class="MenuContainer">
      <button 
        v-for="option in nodeCreationOptions" 
        :key="option.name"
        class="MenuButton xs"
        @click="createNode(option)"
        :title="`Create ${option.name}`"
        :style="{ backgroundColor: option.color }"
      >
        <i :class="option.icon" class="mr-xxs"></i>
        {{ option.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.TopMenu {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  pointer-events: none;
}

.MenuContainer {
  display: flex;
  flex-flow: row nowrap;
  gap: 8px;
  background-color: var(--main-bg);
  border-radius: 0 0 8px 8px;
  padding: var(--space-xs) var(--space-xs);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  pointer-events: auto;
}

.MenuButton {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border: none;
  /*border-radius: 50%;*/
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}

.MenuButton:hover {
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.3);
  filter: brightness(1.1);
}

.MenuButton:active {
  transform: translateY(0px) scale(1.05);
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
