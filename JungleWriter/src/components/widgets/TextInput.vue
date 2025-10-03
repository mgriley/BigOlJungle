<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  helpText: String,
  placeholder: String,
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
  <div class="TextInput StdInput">
    <div class="f-s" v-if="name">{{name}}</div>
    <div class="Parent">
      <input class="EditorInput InputChild" type="text" v-model="value" :placeholder="placeholder">
    </div>
    <div class="HelpText" v-if="helpText">{{helpText}}</div>
  </div>
</template>

<style scoped>
.Parent {
  display: flex;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

.HelpText {
  font-size: var(--f-xs);
  color: var(--mute-text);
  margin-top: var(--space-xxs);
  line-height: 1.4;
}

</style>
