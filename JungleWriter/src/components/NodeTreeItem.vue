<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { gApp } from './State.js'
import { makeDraggableExt, addHoverListener } from './Utils.js'

const props = defineProps({
  node: Object,
  depth: Number,
})

const emit = defineEmits(['dragEvent'])

const isFolder = computed(() => {
  return props.node.children && props.node.children.length
})

let isOpen = computed(() => {
  return props.node.openInNodeTree;
})

function toggleOpen() {
  props.node.openInNodeTree = !props.node.openInNodeTree;
}

function selectNode() {
  gApp.site.selectNode(props.node);    
}

let editingName = ref(false);
let nameInput = ref(null);

function onDoubleClickName() {
  editingName.value = !editingName.value;
  if (editingName.value) {
    nextTick(() => {
      /*nameInput.value.focus();*/
      nameInput.value.select();
    })
  }
}

function onEndEditName() {
  if (editingName.value) {
    editingName.value = false;
  }
}

function onNameEditKey(evt) {
  if (evt.key === "Enter" || evt.key === "Escape") {
    editingName.value = false;
  }
}

let depthText = computed(() => {
  if (props.depth === 0) {
    return "";
  }
  /*return '\u251C' + '\u2500'.repeat(props.depth + 1) + ' ';*/
  /*return '|' + '–'.repeat(props.depth + 1) + ' ';*/
  /*return '\u00A0'.repeat((props.depth - 1)*3) + '\u2517' + ' ';*/
  return '\u00A0'.repeat((props.depth - 2)*3);
})

let styleObject = computed(() => {
  let obj = {};
  if (props.node.isSelected()) {
    obj["background-color"] = "var(--row-highlight-bg)";
  }
  return obj;
})

let nodeIcon = computed(() => {
  const nodeType = props.node.type || props.node.constructor.name;
  
  switch (nodeType) {
    case 'Node':
      return 'bi bi-folder2'; // Group/folder icon
    case 'TextNode':
      return 'bi bi-type';
    case 'ImageNode':
      return 'bi bi-image';
    case 'RectNode':
      return 'bi bi-square';
    case 'OmniNode':
      return 'bi bi-circle';
    case 'LinksNode':
      return 'bi bi-link-45deg';
    default:
      return 'bi bi-file-earmark'; // Default file icon
  }
})

let itemElem = ref(null);
let dragBtn = ref(null);

onMounted(() => {
  setupDrag(itemElem.value, dragBtn.value);
});

</script>

<script>
/*
function getRelPosInElem(elem, mouseX, mouseY) {
  // https://stackoverflow.com/questions/3234256/find-mouse-position-relative-to-element
  let rect = elem.getBoundingClientRect();
  return {x: (mouseX - rect.left)/rect.width, y: (mouseY - rect.top)/rect.height}
}

function isPosInElement(elem, mouseX, mouseY) {
  let pos = getRelPosInElem(elem, mouseX, mouseY);
  return (0 <= pos.x && pos.x <= 1) && (0 <= pos.y && pos.y <= 1);
}

function getCurHoveredNodeItem(mouseX, mouseY) {
  // TODO
  return null;
}

function updateMoveElemIndicator(mouseX, mouseY) {
  let hoverData = getCurHoveredNodeItem(mouseX, mouseY);  
  if (!hoverData) {
    return;
  }
  if (hoveredElem !== null && hoveredElem !== 
}
*/

// TODO - start with MoveUp and MoveDown buttons.
// Important b/c simpler for some people.

var nodeDragInProgress = false;

function setupDrag(itemElem, dragBtn) {
  // TODO - add a hover listener that displays the proper line.
  // Need enter and exit hover handlers.

  /*
  addHoverListener(itemElem, {
    onStart: (evt) => {
    },
    onUpdate: (evt) => {
    },
    onEnd: (evt) => {
    }
  });
  */

  makeDraggableExt(dragBtn, {
    onStart: () => {
      document.body.style.cursor = 'move';
      nodeDragInProgress = true;
      console.log("Drag started!");
      /*emit("dragEvent", "onStart");*/
    },
    onUpdate: (startX, startY, curX, curY) => {
      /*emit("dragEvent", "onUpdate", startX, startY, curX, curY);*/
    },
    onEnd: (startX, startY, endX, endY) => {
      nodeDragInProgress = false;
      document.body.style.cursor = "default";
      /*emit("dragEvent", "onEnd", startX, startY, endX, endY);*/
    }
  })
}
</script>

<template>
  <div :class="{ bold: isFolder, ItemContainer: true }" :style="styleObject"
    @click="selectNode" ref="itemElem">
    <!--<span class="DepthSpan">{{depthText}}</span>-->
    <span v-if="depth > 1" class="DepthSpan ml-xxs mr-xxs">{{depthText}}<i class="bi bi-arrow-return-right"></i></span>
    <!--<span class="NodeTypeIcon"><sup>{{ node.constructor.sUiShortName }}</sup></span>-->
    <button class="OpenBtn SmallButton" v-if="isFolder" @click="toggleOpen">
      <i :class="isOpen ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
    </button>
    <i v-else :class="nodeIcon" class="NodeIcon"></i>
    <template v-if="!editingName">
      <span @dblclick="onDoubleClickName">
      {{ node.name }}
      </span>
    </template>
    <template v-else>
      <input v-model="node.name" ref="nameInput" @keyup="onNameEditKey" @blur="onEndEditName" size="12">
    </template>
    <!--<span class="DragBtn" ref="dragBtn">Drag</span>-->
  </div>
</template>

<style scoped>
.OpenBtn {
  display: inline-block;
  margin-right: 4px;
  background: none;
  border: none;
  color: var(--secondary-text);
  cursor: pointer;
  padding: 2px;
  font-size: 0.9em;
}

.OpenBtn:hover {
  color: var(--main-text);
}

.NodeIcon {
  margin-right: 4px;
  color: var(--secondary-text);
  font-size: 0.9em;
}

.ItemContainer {
  /* background: white; */
  /*margin: 5px 5px;*/

  /*border-top: 1px solid var(--secondary-text);*/
}

.DragBtn {
  cursor: move;
  font-weight: var(--bold-weight);
  margin-left: 8px;
  margin-right: 8px;
  float: right;
}

.NodeTypeIcon {
  margin-left: 8px;
  margin-right: 8px;
  font-weight: var(--bold-weight);
  font-size: 0.75em;
}

.DepthSpan {
  display: inline-block;
  white-space: pre;
  color: rgba(255, 255, 255, 0.4);
}
</style>

