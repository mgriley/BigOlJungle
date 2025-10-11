<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  node: Object
})

const isExpanded = ref(false)

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
}

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
    <div class="Header" @click="toggleExpanded">
      <div class="HeaderLeft">
        <span class="Arrow" :class="{ expanded: isExpanded }">▶</span>
        <div class="EditorSubheading">Advanced</div>
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
  cursor: pointer;
  user-select: none;
}

.HeaderLeft {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.Arrow {
  transition: transform 0.2s ease;
  font-size: 12px;
  color: var(--main-text);
}

.Arrow.expanded {
  transform: rotate(90deg);
}
</style>
