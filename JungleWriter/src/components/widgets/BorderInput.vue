<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import NumberInput from './NumberInput.vue'
import ColorInput from './ColorInput.vue'
import SectionToggle from './SectionToggle.vue'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
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

const isEnabled = computed({
  get() {
    return props.modelValue.enabled;
  },
  set(newVal) {
    props.modelValue.enabled = newVal;
    if (newVal) {
      props.modelValue.style = 'solid';
    } else {
      props.modelValue.style = 'none';
    }
  }
})

</script>

<template>
  <div class="BorderInput">
    <div class="Header">
      <div class="HeaderLeft" v-if="name">
        <div class="EditorSubheading">{{name}}</div>
        <SectionToggle v-model="isEnabled" />
      </div>
    </div>
    <div v-if="isEnabled">
      <NumberInput v-model="value.width" name="Width" :min="0" :labelLeft="true" labelWidth="64px" />
      <ColorInput :color="value.color" name="Color" labelWidth="64px" />
      <NumberInput v-model="value.radius" name="Radius" :min="0" :labelLeft="true" labelWidth="64px" />
    </div>
  </div>
</template>

<style scoped>
.Header {
  margin-bottom: var(--space-xs);
}

.HeaderLeft {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.StdInput {
  margin-right: 16px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

</style>
