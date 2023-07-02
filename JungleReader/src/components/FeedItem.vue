<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import TreeIcon from './TreeIcon.vue'
import draggable from 'vuedraggable'

const props = defineProps({
  feed: Object,
})

const emit = defineEmits(['editFeed'])

function toggleExpandFeed(feed) {
  feed.expanded = !feed.expanded;
}

function selectFeed(feed) {
  gApp.feedReader.setSelectedItem(feed);
}

</script>

<template>
  <div class="FeedItem">
    <div class="FeedControls">
      <TreeIcon :expanded="feed.expanded" @click="toggleExpandFeed(feed)"/>
      <div class="FeedName TextButton" @click="toggleExpandFeed(feed)">{{ feed.name }}</div>
      <div class="FeedButtons">
        <button @click="toggleExpandFeed(feed)">+/-</button>
        <button @click="(evt) => emit('editFeed', feed, evt)">Edit</button>
        <button @click="selectFeed(feed)">Select</button>
      </div>
    </div>
    <template v-if="feed.expanded">
      <div v-for="link in feed.links" :id="link.id" class="Link">
        <p>{{ link.name }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.FeedItem {
  padding-left: 20px;
}

.FeedName {
  margin-right: 20px;
}

.FeedControls {
  display: flex;
}

.Link {
  padding-left: 20px;
}

</style>
