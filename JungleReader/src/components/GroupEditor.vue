<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'

const props = defineProps({
  group: Object
});

</script>

<template>
  <div>
    <input v-model="group.name">
  </div>
</template>

<style scoped>
</style>
