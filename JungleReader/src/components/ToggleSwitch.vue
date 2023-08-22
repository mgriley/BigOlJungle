<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps({
  label: String,
  modelValue: [Boolean],
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
  <div class="ToggleSwitch Flex">
    <p class="Label">{{ label }}</p>
    <label class="switch">
      <input type="checkbox" v-model="value">
      <span class="slider round"></span>
    </label>
  </div>
</template>

<style scoped>

.ToggleSwitch {
  gap: 5px;
  font-size: 1rem;
}

.ToggleSwitch input {
}

.Label {
}

</style>
