<script setup>
import { ref, onMounted, computed } from 'vue'
import FileNameInput from './FileNameInput.vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import ColorInput from './ColorInput.vue'
import SelectorInput from './SelectorInput.vue'
import ImageChooserModal from '../ImageChooserModal.vue'
import PositionInput from './PositionInput.vue'

const props = defineProps({
  editorData: Object
})

let imgChooser = ref(null);

function onSrcNameChanged(newVal) {
  editorData.setSrcName(newVal);
}

let srcName = computed({
  get() {
    return props.editorData.getSrcName();
  },
  set(value) {
    props.editorData.setSrcName(value);
  }
})

let preserveAspectRatio = computed({
  get() {
    return props.editorData.getPreserveAspectRatio();
  },
  set(newVal) {
    props.editorData.setPreserveAspectRatio(newVal);
  }
})

function onStartChooseImg() {
  imgChooser.value.showModal();
}

</script>

<template>
  <div>
    <PositionInput :node="editorData" :includeSize="true" class="mb-m" />
    <div class="mb-m">
      <button @click="onStartChooseImg" class="mb-xs">File: {{ srcName || 'None' }}</button>
      <BoolInput v-model="preserveAspectRatio" name="Preserve aspect ratio" />
    </div>
    <TextInput v-model="editorData.altText" name="Alt text" />

    <ImageChooserModal ref="imgChooser" v-model="srcName" />
    <!-- <SelectorInput v-model="editorData.objectFit" name="Image Fit" :options="['cover', 'contain', 'fill', 'none']" /> -->
  </div>
</template>

<style scoped>
</style>
