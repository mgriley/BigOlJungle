<script setup>
import { ref, onMounted, computed } from 'vue'
import FileNameInput from './FileNameInput.vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import ColorInput from './ColorInput.vue'
import SelectorInput from './SelectorInput.vue'

const props = defineProps({
  editorData: Object
})

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

</script>

<template>
  <div>
    <!-- <FileNameInput name="Img Source" :value="editorData.getSrcName()" @change="(newVal) => editorData.setSrcName(newVal)" /> -->
    <FileNameInput name="Img Source" v-model="srcName" />
    <BoolInput v-model="preserveAspectRatio" name="Preserve Image Aspect Ratio" />
    <NumberInput v-model="editorData.width" name="Width" min="1" />
    <NumberInput v-if="!preserveAspectRatio" v-model="editorData.height" name="Height" min="1" />
    <TextInput v-model="editorData.linkUrl" name="Link URL" />
    <!-- <SelectorInput v-model="editorData.objectFit" name="Image Fit" :options="['cover', 'contain', 'fill', 'none']" /> -->
  </div>
</template>

<style scoped>
</style>
