<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import TextAlignInput from './TextAlignInput.vue'
import FontInput from './FontInput.vue'
import ColorInput from './ColorInput.vue'
import BackgroundInput from './BackgroundInput.vue'
import BorderInput from './BorderInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <div>
    <FontInput v-model="editorData.fontFamily" name="Font Family" :isOptional="true" />
    <NumberInput v-model="editorData.fontSize" name="Font Size" min="1" />
    <ColorInput v-model="editorData.color" name="Color" :isOptional="true" />

    <NumberInput v-model="editorData.width" name="Width" min="1" />
    <NumberInput v-model="editorData.height" name="Height" min="1" />
    <BackgroundInput v-model="editorData.background" name="Background" />
    <BorderInput v-model="editorData.border" name="Border" />
  </div>
</template>

<style scoped>
</style>
