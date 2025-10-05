<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import HelpTooltip from './HelpTooltip.vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'p'
  },
  name: String,
  labelWidth: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const value = computed({
  get() {
    return props.modelValue || 'p'
  },
  set(value) {
    emit('update:modelValue', value)
    emit('change', value)
  }
})

const labelWidth = computed(() => {
  return props.labelWidth || 'auto';
})

const elementOptions = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading-1' },
  { value: 'h2', label: 'Heading-2' },
  { value: 'h3', label: 'Heading-3' }
]

</script>

<template>
  <div class="TextElement StdInput">
    <div class="ElementControls">
      <div class="InputLabel mr-xxs" v-if="name" :style="{ width: labelWidth }">{{name}}</div>
      <select class="ElementSelector" v-model="value">
        <option v-for="option in elementOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <HelpTooltip text="Set the HTML tag to use for this text. Does not affect appearance. Set correctly to improve accessibility and SEO." />
    </div>
  </div>
</template>

<style scoped>
.ElementControls {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.ElementSelector {
  font-size: var(--f-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  border: none;
  border-radius: var(--border-radius-small);
  padding: 4px 8px;
  min-width: 0px;
  width: 120px;
}

</style>
