<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import NumberInput from './NumberInput.vue'
import ColorInput from './ColorInput.vue'

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
    return props.modelValue.style !== 'none';
  },
  set(newVal) {
    if (newVal) {
      props.modelValue.style = 'solid';
    } else {
      props.modelValue.style = 'none';
    }
  }
})

</script>

<template>
  <div class="BorderInput StdInput">
    <div class="Header">
      <div class="InputLabel" v-if="name">{{name}}</div>
      <input class="OptionalToggle" v-model="isEnabled" type="checkbox" name="optionalToggle"/>
    </div>
    <div v-if="isEnabled">
      <NumberInput v-model="value.width" name="Width" min="0" />
      <ColorInput v-model="value.color" name="Color" />
    </div>
  </div>
</template>

<style scoped>
.Header {
  display: flex;
  gap: 8px;
}

.OptionalToggle {
  margin-right: 8px;
}

.StdInput {
  margin-right: 16px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

</style>
