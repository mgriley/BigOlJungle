<script setup>
import { ref, onMounted, computed } from 'vue'
import FileNameInput from './FileNameInput.vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import ColorInput from './ColorInput.vue'

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

</script>

<template>
  <div>
    <!-- <FileNameInput name="Img Source" :value="editorData.getSrcName()" @change="(newVal) => editorData.setSrcName(newVal)" /> -->
    <FileNameInput name="Img Source" v-model="srcName" />
  </div>
</template>

<style scoped>
</style>
