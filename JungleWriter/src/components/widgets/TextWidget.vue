<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { TextNode } from './TextNode.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);

function onClick() {
  if (gApp.site.isEditing) {
    gApp.site.selectNode(props.node);
  }
}

function onLinkClicked(evt) {
  if (gApp.site.isEditing) {
    evt.preventDefault();
  }
}

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <div class="Widget TextWidget" :style="node.getStyleObject()"
      ref="elementRef" @click="onClick">
    <template v-if="node.linkUrl === ''">
      {{ node.text }}
    </template>
    <template v-else>
      <a :href="node.linkUrl" target="_blank" @click="onLinkClicked">{{node.text}}</a>
    </template>
  </div>
</template>

<style scoped>
</style>

<style>
.TextWidget {
  white-space: pre;
}

</style>

