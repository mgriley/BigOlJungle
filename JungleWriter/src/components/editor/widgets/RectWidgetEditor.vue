<script setup>
import { ref, onMounted, computed } from 'vue'
import FileNameInput from './FileNameInput.vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import ColorInput from './ColorInput.vue'
import SelectorInput from './SelectorInput.vue'
import BackgroundInput from './BackgroundInput.vue'
import BorderInput from './BorderInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <div>
    <NumberInput v-model="editorData.width" name="Width" min="1" />
    <NumberInput v-model="editorData.height" name="Height" min="1" />
    <BackgroundInput v-model="editorData.background" name="Background" />
    <BorderInput v-model="editorData.border" name="Border" />
  </div>
</template>

<style scoped>
</style>
