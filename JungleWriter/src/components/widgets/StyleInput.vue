<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import TextInput from './TextInput.vue'
import TextEntryModal from './TextEntryModal.vue'
import Collapse from './Collapse.vue'
import { gApp } from '../State.js'

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

const elementClasses = computed({
  get() {
    return props.node.elementClasses || ''
  },
  set(value) {
    props.node.setElementClasses(value || '')
  }
})

const customCssString = computed({
  get() {
    return gApp.site?.customCssString || ''
  },
  set(value) {
    if (gApp.site) {
      gApp.site.customCssString = value
    }
  }
})

</script>

<template>
  <div class="StyleInput">
    <Collapse v-model="isExpanded" title="Advanced">
      <TextInput 
        v-model="elementId" 
        name="Element ID"
        :placeholder="placeholderId"
        helpText="Set this element's 'id' for custom CSS."
      />
      <TextInput 
        v-model="elementClasses" 
        name="CSS Classes"
        placeholder="class1, class2, class3"
        helpText="Comma-separated list of CSS classes to apply to this element."
      />
      <div class="mt-s">
        <TextEntryModal 
          v-model="customCssString"
          buttonText="Edit custom CSS"
          placeholder="/* Add your custom CSS here */&#10;&#10;.my-element {&#10;  color: red;&#10;}"
          :updateWhileTyping="true"
        />
      </div>
    </Collapse>
  </div>
</template>

<style scoped>
</style>
