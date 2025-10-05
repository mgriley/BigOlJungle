<script setup>
import { ref } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  }
})

const showTooltip = ref(false)
</script>

<template>
  <div class="HelpIcon" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <i class="bi bi-question-circle"></i>
    <div v-if="showTooltip" class="CustomTooltip">
      {{ text }}
    </div>
  </div>
</template>

<style scoped>
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
  background-color: blue;
  color: white;
  border-radius: 4px;
  font-size: var(--f-xs);
  white-space: nowrap;
  max-width: 300px;
  white-space: normal;
  width: max-content;
  z-index: 20000;
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
