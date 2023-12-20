<script setup>
import { ref, onMounted, computed } from 'vue'

let props = defineProps({
  text: String,
  showEllipse: {
    default: false,
    type: Boolean
  }
})

</script>

<template>
  <details>
    <summary class="Summary">{{ text }}</summary>
    <p class="DisclosureBody">
      <slot>Default text</slot>
    </p>
  </details>
</template>

<style scoped>
.Summary {
  color: var(--mute-text);
}
</style>
