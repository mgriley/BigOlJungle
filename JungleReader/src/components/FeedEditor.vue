<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'

const props = defineProps({
  feed: Object
});

</script>

<template>
  <div>
    <input v-model="feed.name">
  </div>
</template>

<style scoped>
</style>
