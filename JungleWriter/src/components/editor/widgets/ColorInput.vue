<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
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
  <div class="ColorInput StdInput">
    <div class="InputLabel" v-if="name">{{name}}</div>
    <div class="Parent">
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="BasicTextInput InputChild" type="color" v-model="value">
    </div>
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

</style>
