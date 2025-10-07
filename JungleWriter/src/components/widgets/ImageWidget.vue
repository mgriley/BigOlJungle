<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidgetDrag, makeDraggableExt } from '../Utils.js'
import { ImageNode } from './ImageNode.js'
import DragCorners from './DragCorners.vue'
import ImageChooserModal from '../ImageChooserModal.vue'

const props = defineProps({
  node: Object
})

let elementRef = ref(null);
let imgChooser = ref(null);

function onClick(evt) {
  if (gApp.site.isEditing) {
    gApp.site.handleNodeClick(props.node, evt);
  }
}

function onDoubleClick(evt) {
  console.log("DOUBLE CLICKED");
  if (gApp.site.isEditing) {
    evt.preventDefault();
    evt.stopPropagation();
    imgChooser.value.showModal();
  }
}

function onLinkClicked(evt) {
  if (gApp.site.isEditing) {
    evt.preventDefault();
  }
}

let srcName = computed({
  get() {
    return props.node.getSrcName();
  },
  set(value) {
    props.node.setSrcName(value);
  }
});

let hasNoImage = computed(() => {
  return !props.node.getSrcName() || props.node.getSrcName().trim() === '';
});

onMounted(() => {
  setupWidgetDrag(elementRef.value, props.node);
})

</script>

<template>
  <div class="Widget ImageWidget" ref="elementRef"
    :style="node.getStyleObject()" @click="onClick" @dblclick="onDoubleClick"
    :class="{ 'no-image': hasNoImage }"
    >
    <img v-if="!hasNoImage"
      :src="node.getSrcUrl()" :alt="node.altText"
    />
    <div v-else class="placeholder-content">
      <i class="bi bi-image mr-xxs"></i>
      Double-click me
    </div>
    <DragCorners v-if="node.selected" :node="node" />
    <ImageChooserModal ref="imgChooser" v-model="srcName" />
  </div>
</template>

<style scoped>
.ImageWidget {
  user-select: none;
}

.ImageWidget.no-image {
  background-color: blue;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ImageWidget.no-image a {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.placeholder-content {
  color: white;
  padding: var(--space-xs);
  font-size: var(--f-l);
}

.placeholder-content i {
}
</style>

<style>
</style>

