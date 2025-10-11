<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  helpText: String,
  placeholder: String,
  rows: {
    type: Number,
    default: 3
  }
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
  <div class="TextAreaInput StdInput">
    <div class="f-s" v-if="name">{{name}}</div>
    <div class="Parent">
      <textarea 
        class="EditorTextArea InputChild" 
        v-model="value" 
        :placeholder="placeholder"
        :rows="rows"
      ></textarea>
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

.EditorTextArea {
  width: 100%;
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
  font-size: inherit;
  line-height: 1.4;
}

.HelpText {
  font-size: var(--f-xs);
  color: var(--mute-text);
  margin-top: var(--space-xxs);
  line-height: 1.4;
}

</style>
