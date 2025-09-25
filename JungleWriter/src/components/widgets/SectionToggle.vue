<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const isEnabled = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>

<template>
  <div class="SectionToggle">
    <label class="ToggleSwitch">
      <input type="checkbox" v-model="isEnabled">
      <span class="Slider"></span>
    </label>
  </div>
</template>

<style scoped>
.SectionToggle {
  display: flex;
  align-items: center;
}

.ToggleSwitch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.ToggleSwitch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.Slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--medium-color);
  transition: 0.2s;
  border-radius: 24px;
}

.Slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--light-color);
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .Slider {
  background-color: var(--editor-header-color);
}

input:checked + .Slider:before {
  transform: translateX(20px);
  background-color: var(--white-color);
}

input:focus + .Slider {
  box-shadow: 0 0 1px var(--editor-header-color);
}
</style>
