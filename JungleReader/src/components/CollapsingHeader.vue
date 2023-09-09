<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import TextTreeIcon from './TextTreeIcon.vue'

const props = defineProps([
  'modelValue'
])
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
  <div class="Header">
    <TextTreeIcon class="GroupName Collapse" :expanded="value" @click="value = !value" />
    <slot>Header</slot>
  </div>
</template>

<style scoped>
.Header {
  display: flex;
  align-items: baseline;
}

.Collapse {
  font-weight: 600;
  margin-right: 10px;
  /*color: var(--nice-red);*/
}
</style>
