<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import FeedViewer from './FeedViewer.vue'

</script>

<template>
  <div class="FeedView">
    <FeedViewer :feed="gApp.feedReader.getFeedWithId($route.params.id)" />
  </div>
</template>

<style scoped>
</style>
