<script setup>
import { ref, shallowRef, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag } from '../Utils.js'
import { OmniNode } from './OmniNode.js'
import DragCorners from './DragCorners.vue'

import FeedView from './FeedView.vue'
import BlogView from './BlogView.vue'
import FilesView from './FilesView.vue'
import GalleryView from './GalleryView.vue'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);
let curTab = shallowRef(GalleryView);

let tabs = [
  {name: 'Gallery', view: GalleryView},
  {name: 'Blog', view: BlogView},
  {name: 'Feed', view: FeedView},
  {name: 'Files', view: FilesView},
];

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
  <div class="Widget OmniWidget" :style="node.getStyleObject()"
      ref="elementRef" @click="onClick">
    <div class="ButtonRow Flex MarginBotS">
      <p v-for="tab in tabs" class="TabButton TextButton"
        @click="curTab = tab.view" :class="{IsActive: curTab == tab.view}">{{tab.name}}</p>
    </div>
    <div class="ContentArea">
      <component :is="curTab"></component>
    </div>
    <DragCorners v-if="node.selected" :node="node" />
  </div>
</template>

<style scoped>
.ButtonRow {
  gap: var(--space-m);
  border-bottom: 1px solid;
}

.TabButton {
}

.TabButton.IsActive {
  color: DeepPink;
}

.OmniWidget {
  background-color: blue;
  padding: var(--space-s) var(--space-m);

  /* Note: this is required to get the ContentArea overflow working */
  /* https://stackoverflow.com/questions/38066204/prevent-child-div-from-overflowing-parent-div */
  display: flex;
  flex-direction: column;
}

.ContentArea {
  overflow-y: scroll;
  scrollbar-width: thin;
  /* scrollbar-color: red orange; */
}
</style>

