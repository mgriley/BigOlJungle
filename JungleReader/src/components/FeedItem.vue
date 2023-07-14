<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'
import EditButton from './EditButton.vue'

const props = defineProps({
  feed: Object,
})

const emit = defineEmits(['editFeed'])

function toggleExpandFeed(feed) {
  feed.expanded = !feed.expanded;
}

function onFeedClicked(feed) {
  toggleExpandFeed(feed);
  gApp.feedReader.setSelectedFeed(feed);
}

function selectFeed(feed) {
  gApp.feedReader.setSelectedItem(feed);
}

</script>

<template>
  <div class="FeedItem">
    <div class="FeedControls">
      <div class="FeedTitleBar" @click="onFeedClicked(feed)">
        <!-- <TreeIcon :expanded="feed.expanded"/> -->
        <div class="FeedName TextButton">{{ feed.name }}</div>
        <div class="FeedInfo TextButton">{{feed.mostRecentLinkTimeStr()}}</div>
      </div>
      <div class="FeedButtons">
        <!-- <button @click="toggleExpandFeed(feed)">+/-</button> -->
        <EditButton @click="(evt) => emit('editFeed', feed, evt)" />
        <div class="FeatherIcon">
          <vue-feather class="MarginLeft" type="alert-octagon" v-if="feed.isError" />
        </div>
        <!-- <p class="ErrorIndicator" v-if="feed.isError">Error</p> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.FeedItem {
  padding-left: 20px;
}

.FeedTitleBar {
  display: flex;
  margin-right: 20px;
}

.FeedName {
  margin-right: 5px;
}

.FeedControls {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.Link {
  /* padding-left: 30px; */
  /* margin-bottom: 1em; */
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
  /* line-height: 1; */
}

.Bullet {
  margin-right: 10px;
}

.ExtraString {
  margin-left: 5px;
}

.DaysAgo {
  margin-left: 10px;
}

.FeedButtons {
  display: flex;
}

</style>
