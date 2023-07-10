<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'

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
        <p class="ErrorIndicator" v-if="feed.isError">Error</p>
        <p><a v-if="feed.mainSiteUrl" :href="feed.mainSiteUrl" target="_blank">Go to site</a></p>
      </div>
    </div>
    <template v-if="feed.expanded">
      <template v-if="!feed.isError">
        <div v-for="link in feed.links" :id="link.id" class="Link">
          <p class="LinkElem">
            <span class="Bullet">&#8226;</span>
            <a :href="link.link" target="_blank">
              {{ link.getStringDesc() }}
            </a>
            <span class="DaysAgo">{{ "(" + getTimeAgoStr(new Date(link.pubDate)) + ")" }}</span>
          </p>
        </div>
      </template>
      <template v-else>
        <div class="Link ErrorText">
          <p>{{ feed.errorMsg }}</p>
        </div>
      </template>
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

.ErrorIndicator {
  color: red;
}

.ErrorText {
  color: red;
}

.LinkElem {
  /*
  max-width: 1000px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  */
}

.Bullet {
  margin-right: 10px;
}

.DaysAgo {
  margin-left: 10px;
}

.FeedButtons {
  display: flex;
}

</style>
