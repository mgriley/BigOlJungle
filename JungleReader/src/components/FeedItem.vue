<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'
import EditButton from './EditButton.vue'

const props = defineProps({
  feed: Object,
})

const emit = defineEmits(['editFeed'])

function onFeedClicked(feed) {
  feed.reloadIfStale();
  gApp.router.push({name: 'feed', params: {id: feed.id}})
}

</script>

<template>
  <div class="FeedItem">
    <div class="FeedControls">
      <div class="FeedTitleBar" @click="onFeedClicked(feed)">
        <div class="FeedName TextButton">{{ feed.name }}</div>
      </div>
      <div @click="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
      <div class="FeedButtons">
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
  font-size: 4rem;
  font-weight: 800;
}

.FeedControls {
  display: flex;
  flex-wrap: nowrap;
  white-space: nowrap;
  align-items: baseline;
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

.EditButton {
  margin-left: 10px;
  color: var(--very-mute-text);
  font-size: 0.8rem;
  font-weight: normal;
}

</style>
