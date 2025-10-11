<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  node: Object
})

const elementId = computed({
  get() {
    return props.node.elementId || ''
  },
  set(value) {
    props.node.setElementId(value || null)
  }
})

let placeholderId = computed(() => {
  return props.node.getElementId();
})

</script>

<template>
  <div class="StyleInput">
    <TextInput 
      v-model="elementId" 
      name="Element ID"
      :placeholder="placeholderId"
      helpText="Override this element's 'id', to target with custom CSS and JS."
    />
  </div>
</template>

<style scoped>
</style>
