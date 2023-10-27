<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import NumberInput from './NumberInput.vue'
import ColorInput from './ColorInput.vue'
import BasicSelector from '../BasicSelector.vue'

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

</script>

<template>
  <div class="BackgroundInput StdInput">
    <div class="Header">
      <div class="InputLabel" v-if="name">{{name}}</div>
    </div>
    <BasicSelector :value="value.type" :options="['solid']" @change="(newType) => value.type = newType" />
    <div v-if="value.type == 'solid'">
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
