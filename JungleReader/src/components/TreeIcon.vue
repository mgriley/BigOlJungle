<script setup>
const props = defineProps(['expanded'])
</script>

<template>
  <vue-feather class="TreeChevron" :type="expanded ? 'chevron-down' : 'chevron-right'"></vue-feather>
</template>

<style scoped>
.TreeChevron {
  display: flex;
  flex-direction: row;
  align-items: center;

  margin-right: 5px;
  cursor: pointer;
}
</style>
