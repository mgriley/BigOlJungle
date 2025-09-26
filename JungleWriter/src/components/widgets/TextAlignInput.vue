<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['modelValue', 'name'])
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
  <div class="StdInput TextAlignParent">
    <div class="InputLabel">Align</div>
    <div class="AlignButtons">
      <button 
        class="AlignToggle" 
        :class="{ active: value === 'left' }"
        @click="value = 'left'"
        title="Align Left"
      >
        <i class="bi bi-text-left"></i>
      </button>
      <button 
        class="AlignToggle" 
        :class="{ active: value === 'center' }"
        @click="value = 'center'"
        title="Align Center"
      >
        <i class="bi bi-text-center"></i>
      </button>
      <button 
        class="AlignToggle" 
        :class="{ active: value === 'right' }"
        @click="value = 'right'"
        title="Align Right"
      >
        <i class="bi bi-text-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.TextAlignParent {
  margin-bottom: var(--space-xs);
}

.InputLabel {
  margin-bottom: var(--space-xxs);
}

.AlignButtons {
  display: flex;
  gap: var(--space-xxs);
}

.AlignToggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--f-s);
}

.AlignToggle:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.AlignToggle.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--darkest-color);
}
</style>
