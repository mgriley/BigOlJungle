<script setup>
import { computed } from 'vue'

const props = defineProps({
  textStyle: Object
})

const emit = defineEmits(['update:textStyle'])

const textStyle = computed({
  get() {
    return props.textStyle
  },
  set(value) {
    emit('update:textStyle', value)
  }
})

function toggleBold() {
  textStyle.value.bold = !textStyle.value.bold
}

function toggleItalic() {
  textStyle.value.italic = !textStyle.value.italic
}

function toggleUnderline() {
  textStyle.value.underline = !textStyle.value.underline
}
</script>

<template>
  <div class="FontStyleButtons">
    <button 
      class="StyleToggle" 
      :class="{ active: textStyle.bold }"
      @click="toggleBold"
      title="Bold"
    >
      <strong>B</strong>
    </button>
    <button 
      class="StyleToggle" 
      :class="{ active: textStyle.italic }"
      @click="toggleItalic"
      title="Italic"
    >
      <em>I</em>
    </button>
    <button 
      class="StyleToggle" 
      :class="{ active: textStyle.underline }"
      @click="toggleUnderline"
      title="Underline"
    >
      <span style="text-decoration: underline;">U</span>
    </button>
  </div>
</template>

<style scoped>
.FontStyleButtons {
  display: flex;
  flex-direction: row;
  gap: var(--space-xxs);
  margin-bottom: var(--space-xs);
}

.StyleToggle {
  flex: 1;
  min-width: 32px;
  height: 24px;
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
  font-weight: normal;
}

.StyleToggle:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.StyleToggle.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--darkest-color);
}

.StyleToggle strong {
  font-weight: bold;
}

.StyleToggle em {
  font-style: italic;
  font-family: serif;
  font-size: 18px;
}
</style>
