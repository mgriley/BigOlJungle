<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { TextNode } from './TextNode.js'
import { LinkType } from './LinkInput.js'
import DragCorners from './DragCorners.vue'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);
let inputRef = ref(null);
let isEditing = ref(false);

function onClick() {
  if (gApp.site.isEditing) {
    gApp.site.selectNode(props.node);
  }
}

function onDoubleClick() {
  if (gApp.site.isEditing) {
    startEditing();
  }
}

function onLinkClicked(evt) {
  if (gApp.site.isEditing) {
    evt.preventDefault();
  }
}

async function startEditing() {
  if (isEditing.value) {
    return;
  }
  isEditing.value = true;
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    // Position cursor at the end instead of selecting all text
    inputRef.value.setSelectionRange(inputRef.value.value.length, inputRef.value.value.length);
    autoResizeTextarea();
  }
}

function stopEditing() {
  isEditing.value = false;
}

function onInputKeydown(evt) {
  if (evt.key === 'Enter' && !evt.shiftKey) {
    evt.preventDefault();
    stopEditing();
  } else if (evt.key === 'Escape') {
    evt.preventDefault();
    stopEditing();
  }
  // Shift+Enter will naturally insert a new line since we don't prevent it
}

function onInputBlur() {
  stopEditing();
}

function autoResizeTextarea() {
  if (inputRef.value) {
    // Reset height to auto to get the correct scrollHeight
    inputRef.value.style.height = 'auto';
    // Set height to scrollHeight to fit content
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px';
  }
}

function onInput() {
  autoResizeTextarea();
}


onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <component 
    :is="node.elementType" 
    class="Widget TextWidget NoSelect" 
    :class="{ 'editing': isEditing }" 
    :style="node.getStyleObject()"
    ref="elementRef" 
    @click="onClick" 
    @dblclick="onDoubleClick"
  >
    <div v-if="!isEditing">
      <template v-if="!node.link.hasLink()">
        {{ node.text || "Double-click me 🐍"}}
      </template>
      <template v-else>
        <a class="TextLink" v-bind="node.link.getLinkAttributes()" @click="onLinkClicked">
          {{node.text || "Double-click me 🐍"}}
        </a>
      </template>
    </div>
    <!-- Note: must do mousedown.stop here o/w widget drag screws -->
    <!-- up the click-to-move-cursor functionality of the text-area -->
    <textarea v-else
      ref="inputRef"
      class="TextWidgetInput"
      v-model="node.text"
      @keydown="onInputKeydown"
      @blur="onInputBlur"
      @input="onInput"
      @mousedown.stop
    ></textarea>
    <DragCorners v-if="node.selected" :node="node" />
  </component>
</template>

<style>
/* Match to the outer div exactly so that text lines up */
.TextWidgetInput {
  background: transparent;
  border: none;
  border-radius: 0;
  outline: none;
  font-size: inherit;
  font-family: inherit;
  color: inherit;
  font-weight: inherit;
  font-style: inherit;
  text-decoration: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-align: inherit;
  white-space: pre-wrap;
  width: 100%;
  height: auto;
  padding: 0;
  margin: 0;
  resize: none;
  overflow: hidden;
  min-height: 1em;
}

.TextWidget.editing {
  outline: 3px solid blue !important;
  outline-offset: 2px;
}

</style>

<style>
</style>

