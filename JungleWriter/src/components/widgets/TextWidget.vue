<script setup>
import { ref, onMounted, reactive, computed, nextTick } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { TextNode } from './TextNode.js'
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
  isEditing.value = true;
  await nextTick();
  if (inputRef.value) {
    inputRef.value.focus();
    inputRef.value.select();
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
  //stopEditing();
}

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <div class="Widget TextWidget" :style="node.getStyleObject()"
      ref="elementRef" @click="onClick" @dblclick="onDoubleClick">
    <template v-if="!isEditing">
      <template v-if="node.linkUrl === ''">
        {{ node.text }}
      </template>
      <template v-else>
        <a :href="node.linkUrl" target="_blank" @click="onLinkClicked">{{node.text}}</a>
      </template>
    </template>
    <template v-else>
      <textarea 
        ref="inputRef"
        class="TextWidgetInput"
        v-model="node.text"
        @keydown="onInputKeydown"
        @blur="onInputBlur"
      ></textarea>
    </template>
    <DragCorners v-if="node.selected" :node="node" />
  </div>
</template>

<style>
.TextWidgetInput {
  background: transparent;
  border: none;
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
  height: 100%;
  padding: 0;
  margin: 0;
  resize: none;
  overflow: visible;
}
</style>

<style>
</style>

