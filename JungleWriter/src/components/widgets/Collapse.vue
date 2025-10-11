<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const isExpanded = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="Collapse">
    <div class="Header" @click="toggleExpanded">
      <div class="HeaderLeft">
        <span class="Arrow" :class="{ expanded: isExpanded }">▶</span>
        <div class="EditorSubheading">{{ title }}</div>
      </div>
    </div>
    <div v-if="isExpanded" class="Content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.Header {
  margin-bottom: var(--space-xs);
  cursor: pointer;
  user-select: none;
}

.HeaderLeft {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.Arrow {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: var(--main-text);
}

.Arrow.expanded {
  transform: rotate(90deg);
}

.Content {
  margin-top: var(--space-xs);
}
</style>
