<script setup>
const props = defineProps(['expanded'])
</script>

<template>
  <p class="TextChevron"><b>{{ expanded ? "[-]" : "[+]" }}</b></p>
</template>

<style scoped>
.TextChevron {
  margin-right: 5px;
  cursor: pointer;
}
</style>
