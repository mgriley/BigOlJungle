<script setup>
import { gApp } from './State.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'

const nodeCreationOptions = [
  {
    name: "Group",
    icon: "bi bi-folder",
    classCtor: gNodeDataMap["Node"].nodeClass,
  },
  {
    name: "Rect",
    icon: "bi bi-app",
    classCtor: gNodeDataMap["RectNode"].nodeClass,
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
        class="MenuButton"
        @click="createNode(option)"
        :title="`Create ${option.name}`"
      >
        <i :class="option.icon"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.TopMenu {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1500;
  pointer-events: none;
}

.MenuContainer {
  display: flex;
  flex-flow: row nowrap;
  gap: 4px;
  background-color: var(--popup-bg);
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-m);
  padding: 8px;
  box-shadow: var(--box-shadow-front);
  backdrop-filter: blur(8px);
  pointer-events: auto;
}

.MenuButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  background-color: var(--dark-color);
  color: var(--main-text);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s ease;
}

.MenuButton:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
  transform: translateY(-1px);
  box-shadow: 0px 4px 8px hsl(0, 0%, 20%);
}

.MenuButton:active {
  transform: translateY(0px);
  box-shadow: none;
}
</style>
