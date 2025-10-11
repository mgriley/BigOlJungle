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

</script>

<template>
  <div class="StyleInput">
    <TextInput 
      v-model="elementId" 
      name="Element ID" 
      placeholder="Leave blank for auto-generated ID"
      helpText="Override the HTML element ID for this node. Used for CSS targeting and JavaScript."
    />
  </div>
</template>

<style scoped>
</style>
