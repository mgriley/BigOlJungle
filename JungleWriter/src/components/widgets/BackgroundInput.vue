<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import NumberInput from './NumberInput.vue'
import ColorInput from './ColorInput.vue'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
})
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>

<template>
  <div class="BackgroundInput">
    <div class="EditorSubheading" v-if="name">{{name}}</div>
    <ColorInput :color="value.color" name="Color" />
  </div>
</template>

<style scoped>

</style>
