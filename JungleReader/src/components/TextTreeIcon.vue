<script setup>
const props = defineProps(['expanded'])
</script>

<template>
  <p class="TextChevron TextButton">{{ expanded ? "-" : "+" }}</p>
</template>

<style scoped>
.TextChevron {
  margin-right: 5px;
  cursor: pointer;
  color: var(--header-text);
}
</style>
