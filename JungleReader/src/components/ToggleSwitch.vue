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
      <span class="slider round"></span>
      <input class="Checkbox" type="checkbox" v-model="value">
    </label>
  </div>
</template>

<style scoped>

.ToggleSwitch {
  gap: var(--space-xxs);
  font-size: var(--p-size);
  align-items: baseline;
}

.ToggleSwitch input {
}

.Label {
}

.Checkbox {
  width: 18px;
  height: 18px;
  /* accent-color: var(--brand-color-yellow); */
}

</style>
