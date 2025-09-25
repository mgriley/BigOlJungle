<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import NumberInput from './NumberInput.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ width: 0, height: 0 })
  },
  name: String,
  min: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue || { width: 0, height: 0 }
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const width = computed({
  get() {
    return value.value.width
  },
  set(newWidth) {
    value.value = { ...value.value, width: newWidth }
  }
})

const height = computed({
  get() {
    return value.value.height
  },
  set(newHeight) {
    value.value = { ...value.value, height: newHeight }
  }
})
</script>

<template>
  <div class="PositionInput StdInput">
    <div class="InputLabel" v-if="name">{{ name }}</div>
    <div class="InputRow">
      <NumberInput 
        v-model="width" 
        name="W" 
        :min="min"
        class="CompactInput"
      />
      <NumberInput 
        v-model="height" 
        name="H" 
        :min="min"
        class="CompactInput"
      />
    </div>
  </div>
</template>

<style scoped>
.PositionInput {
  margin-right: 16px;
}

.InputRow {
  display: flex;
  gap: var(--space-xs);
}

.CompactInput {
  flex: 1;
  margin-right: 0;
}

.CompactInput .InputLabel {
  font-size: var(--smaller-size);
  margin-bottom: var(--space-xxs);
}
</style>
