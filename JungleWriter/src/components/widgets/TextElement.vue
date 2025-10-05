<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

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

const showTooltip = ref(false)

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
      <div class="HelpIcon" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
        <i class="bi bi-question-circle"></i>
        <div v-if="showTooltip" class="CustomTooltip">
          Choose the HTML tag to use for this text. Does not affect appearance. Use &lt;p&gt; for paragraph, &lt;h1&gt; for header-1, etc. Set properly for better accessibility and SEO.
        </div>
      </div>
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

.HelpIcon {
  color: var(--mute-text);
  font-size: var(--f-s);
  cursor: help;
  display: flex;
  align-items: center;
  position: relative;
  margin-left: var(--space-xs);
}

.HelpIcon:hover {
  color: var(--main-text);
}

.CustomTooltip {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 8px 12px;
  background-color: var(--popup-bg);
  color: var(--popup-text);
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  font-size: var(--f-xs);
  white-space: nowrap;
  max-width: 300px;
  white-space: normal;
  width: max-content;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.CustomTooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 12px;
  border: 6px solid transparent;
  border-top-color: var(--popup-bg);
}
</style>
