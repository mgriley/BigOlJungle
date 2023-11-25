<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { LinksNode } from './LinksNode.js'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);

function onClick() {
  if (gApp.site.isEditing) {
    gApp.site.selectNode(props.node);
  }
}

function onLinkClicked(evt, dstPage) {
  evt.preventDefault();
  if (!gApp.site.isEditing) {
    gApp.router.push({name: dstPage})
  }
}

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <!-- Note: do not use router-links here. Theyt don't have a decent way to preventDefault, clunky -->
  <div class="Widget LinksWidget" :style="node.getStyleObject()"
      ref="elementRef" @click="onClick">
    <a href="" class="Link" @click="(evt) => onLinkClicked(evt, 'feed')">Feed</a>
    <a href="" class="Link" @click="(evt) => onLinkClicked(evt, 'files')">Files</a>
    <a href="" class="Link" @click="(evt) => onLinkClicked(evt, 'blog')">Blog</a>
  </div>
</template>

<style scoped>
.Link {
  color: black;
  display: block;
}
</style>

