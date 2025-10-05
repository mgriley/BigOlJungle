<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { gApp } from './State.js'
import { makeDraggableExt, addHoverListener } from './Utils.js'

const props = defineProps({
  node: Object,
  depth: Number,
  dragState: Object,
})

const emit = defineEmits(['dragEvent', 'dragStart', 'dragOver', 'dragEnd', 'dropEnd'])

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
  return '\u00A0'.repeat((props.depth - 1)*3);
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
      return 'bi bi-app';
    case 'OmniNode':
      return 'bi bi-circle';
    case 'LinksNode':
      return 'bi bi-link-45deg';
    default:
      return 'bi bi-file-earmark'; // Default file icon
  }
})

let usesAutomaticName = computed(() => {
  return props.node.getAutomaticName() !== null;
})

let itemElem = ref(null);
let dragBtn = ref(null);

const isDraggedOver = computed(() => {
  return props.dragState?.dropTarget === props.node;
});

const dragOverPosition = computed(() => {
  return props.dragState?.dropPosition;
});

const isDragging = computed(() => {
  return props.dragState?.draggedNode === props.node;
});

function onDragStart(evt) {
  evt.dataTransfer.effectAllowed = 'move';
  evt.dataTransfer.setData('text/plain', ''); // Required for Firefox
  emit('dragStart', props.node);
}

function onDragOver(evt) {
  if (props.dragState?.isDragging && props.dragState.draggedNode !== props.node) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move';
    
    // Determine drop position based on mouse position within the element
    const rect = evt.currentTarget.getBoundingClientRect();
    const y = evt.clientY - rect.top;
    const height = rect.height;
    
    let position;
    if (props.node.getAllowsChildren() && y > height * 0.3 && y < height * 0.7) {
      position = 'inside';
    } else if (y < height * 0.5) {
      position = 'before';
    } else {
      position = 'after';
    }
    
    emit('dragOver', props.node, position);
  }
}

function onDragLeave(evt) {
  // Only clear drop target if we're actually leaving this element
  //console.log('onDragLeave for node:', props.node.name);
  if (!evt.currentTarget.contains(evt.relatedTarget)) {
    if (props.dragState?.dropTarget === props.node) {
      emit('dragOver', null, null);
    }
  }
}

function onDrop(evt) {
  //console.log('onDrop for node:', props.node.name);
  evt.preventDefault();
  emit('dragEnd');
}

function onDragEnd(evt) {
  //console.log('onDragEnd for node:', props.node.name);
  // This fires when drag ends, regardless of whether drop occurred
  emit('dropEnd');
}

onMounted(() => {
});

</script>

<template>
  <div 
    :class="{ 
      bold: isFolder, 
      ItemContainer: true,
      'drag-over': isDraggedOver,
      'drag-over-before': isDraggedOver && dragOverPosition === 'before',
      'drag-over-after': isDraggedOver && dragOverPosition === 'after',
      'drag-over-inside': isDraggedOver && dragOverPosition === 'inside',
      'dragging': isDragging
    }" 
    class="NoSelect" 
    :style="styleObject"
    @click="selectNode" 
    ref="itemElem"
    draggable="true"
    @dragstart="onDragStart"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="onDragEnd"
  >
    <span v-if="depth > 0" class="DepthSpan ml-xxs mr-xxs">
      {{depthText}}<!--<i class="bi bi-arrow-return-right"></i>-->
    </span>
    <button class="OpenBtn SmallButton" v-if="isFolder" @click="toggleOpen">
      <i :class="isOpen ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
    </button>
    <i v-else :class="nodeIcon" class="NodeIcon"></i>
    <p v-if="!editingName" class="NodeName InlineBlock ml-xxs f-m">
      <span v-if="!usesAutomaticName" @dblclick="onDoubleClickName">
      {{ node.name }}
      </span>
      <span v-else>
      {{ node.getAutomaticName() }}
      </span>
    </p>
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
  display: inline-block;
  width: 20px;
  margin-right: 4px;
  color: var(--secondary-text);
  font-size: 0.9em;
  text-align: center;
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

.NodeName {
  color: var(--main-text);
}

.ItemContainer.drag-over-before {
  border-top: 3px solid #007bff;
}

.ItemContainer.drag-over-after {
  border-bottom: 3px solid #007bff;
}

.ItemContainer.drag-over-inside {
  border-left: 3px solid #007bff;
  background-color: var(--link-hover-bg);
}

.ItemContainer.dragging {
  opacity: 0.5;
}

.ItemContainer[draggable="true"] {
  cursor: move;
}
</style>

