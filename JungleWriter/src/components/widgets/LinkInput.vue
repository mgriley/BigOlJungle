<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { LinkType } from './LinkInput.js'
import TextInput from './TextInput.vue'

const props = defineProps({
  input: Object,
  name: String,
  labelWidth: {
    type: String,
    default: null
  }
})

const typeValue = computed({
  get() {
    return props.input?.type || LinkType.None
  },
  set(type) {
    if (props.input) {
      props.input.type = type;
    }
  }
})

const urlValue = computed({
  get() {
    return props.input?.url || ''
  },
  set(url) {
    if (props.input) {
      props.input.url = url;
    }
  }
})

const labelWidth = computed(() => {
  return props.labelWidth || 'auto';
})

const linkTypeOptions = [
  { value: LinkType.None, label: 'None' },
  { value: LinkType.External, label: 'External' },
  { value: LinkType.Download, label: 'Download' }
]

let placeholderText = computed(() => {
  switch (typeValue.value) {
    case LinkType.External:
      return 'www.example.com';
    case LinkType.Download:
      return 'myfile.pdf';
    default:
      return '';
  }
});

let helpText = computed(() => {
  switch (typeValue.value) {
    case LinkType.External:
      return 'Give an external website to link to.';
    case LinkType.Download:
      return "Give the name of a file you uploaded in the 'Upload Files' tab."
    default:
      return '';
  }
});

</script>

<template>
  <div class="LinkInput StdInput">
    <div class="f-s mb-xxs" v-if="name">🔗 {{name}}</div>
    <div class="LinkControls">
      <select class="TypeSelector" v-model="typeValue">
        <option v-for="option in linkTypeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <div class="UrlInputContainer" v-if="typeValue !== LinkType.None">
        <TextInput 
          v-model="urlValue" 
          :placeholder="placeholderText"
          :helpText="helpText"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.LinkControls {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.TypeSelector {
  font-size: var(--f-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  border: none;
  border-radius: var(--border-radius-small);
  padding: 4px 8px;
  min-width: 120px;
  max-width: 200px;
}

.UrlInputContainer {
  width: 100%;
}

/* Override TextInput styles when used within LinkInput */
.UrlInputContainer :deep(.TextInput) {
  margin-bottom: 0;
}

.UrlInputContainer :deep(.f-s) {
  display: none; /* Hide the name label since we show it at the parent level */
}
</style>
