<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import TextInput from './TextInput.vue'
import SectionToggle from './SectionToggle.vue'

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
    <div class="Header">
      <div class="HeaderLeft">
        <div class="EditorSubheading">Custom Styles</div>
        <SectionToggle v-model="isExpanded" />
      </div>
    </div>
    <div v-if="isExpanded">
      <TextInput 
        v-model="elementId" 
        name="Element ID"
        :placeholder="placeholderId"
        helpText="Override this element's 'id', to target with custom CSS and JS."
      />
    </div>
  </div>
</template>

<style scoped>
.Header {
  margin-bottom: var(--space-xs);
}

.HeaderLeft {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}
</style>
