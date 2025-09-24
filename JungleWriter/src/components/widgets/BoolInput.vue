<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['modelValue', 'name'])
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
  </div>
</template>

<style scoped>
.BoolParent {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
}

.BoolParent input {
  margin-right: 4px;
}

.Checkbox {
  width: 16px;
  height: 16px;
}
</style>
