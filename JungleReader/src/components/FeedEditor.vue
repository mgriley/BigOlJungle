<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'
import OptionsInput from './OptionsInput.vue'
import draggable from 'vuedraggable'

const props = defineProps({
  feed: Object
});

</script>

<template>
  <div class="FeedHeader">
    <div>GroupSelector</div>
    <input v-model="feed.name" class="Block">
  </div>
  <div>TypeSelector</div>
  <input v-model="feed.url" class="Block">

  <p>Options:</p>
  <OptionsInput :options="feed.options" />
</template>

<style scoped>
.FeedHeader {
  /* display: flex; */
}
</style>
