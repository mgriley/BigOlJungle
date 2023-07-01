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
  <div class="BoolParent">
    <input v-model="value" type="checkbox" name="name"/>
    <label for="name">{{name}}</label>
  </div>
</template>

<style scoped>
.BoolParent input {
  margin-right: 10px;
}
</style>
