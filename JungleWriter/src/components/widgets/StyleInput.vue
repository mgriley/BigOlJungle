<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import TextInput from './TextInput.vue'
import Collapse from './Collapse.vue'

const props = defineProps({
  node: Object
})

const isExpanded = ref(false)

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
    <Collapse v-model="isExpanded" title="Advanced">
      <TextInput 
        v-model="elementId" 
        name="Element ID"
        :placeholder="placeholderId"
        helpText="Override this element's 'id', to target with custom CSS and JS."
      />
    </Collapse>
  </div>
</template>

<style scoped>
</style>
