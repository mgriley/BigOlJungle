<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
  helpText: String,
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

const optionalValue = computed({
  get() {
    return props.modelValue !== null;
  },
  set(value) {
    if (value) {
      //console.log("DefaultValue: "+props.defaultValue);
      emit('update:modelValue', props.defaultValue);
    } else {
      emit('update:modelValue', null);
    }
  }
})

</script>

<template>
  <div class="TextInput StdInput">
    <div class="f-s" v-if="name">{{name}}</div>
    <div class="Parent">
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="EditorInput InputChild" type="text" v-model="value">
    </div>
    <div class="HelpText" v-if="helpText">{{helpText}}</div>
  </div>
</template>

<style scoped>
.Parent {
  display: flex;
}

.OptionalToggle {
  margin-right: 8px;
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
