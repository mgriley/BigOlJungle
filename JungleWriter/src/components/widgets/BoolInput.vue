<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['modelValue', 'name', 'helpText'])
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
  <div class="StdInput BoolParent">
    <input v-model="value" type="checkbox" name="name" class="Checkbox" />
    <label for="name">{{name}}</label>
    <p v-if="helpText" class="mute-text f-xs">{{helpText}}</p>
  </div>
</template>

<style scoped>
.BoolParent {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  font-size: var(--f-m);
}

.BoolParent input {
  margin-right: 4px;
}

.Checkbox {
  width: 16px;
  height: 16px;
}
</style>
