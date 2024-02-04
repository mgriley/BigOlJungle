<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

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
  <div class="TextInput StdInput">
    <div class="InputLabel" v-if="name">{{name}}</div>
    <div class="Parent">
      <input class="BasicTextInput InputChild" type="text" v-model="value">
    </div>
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

</style>
