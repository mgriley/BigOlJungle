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
  if (feed.type == "Bookmark") {
    window.open(feed.url, "_blank").focus();
  } else {
    feed.reloadIfStale();
    gApp.router.push({name: 'feed', params: {id: feed.id}})
  }
}

</script>

<template>
  <div class="FeedTile" @click="onFeedClicked(feed)">
    <div class="FeedTitle">
      {{ feed.name }}
    </div>
    <div @click.stop="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
    <!--
    <div class="FeedControls">
      <div class="FeedTitleBar" @click="onFeedClicked(feed)">
        <div class="FeedName TextButton">{{ feed.name }}</div>
      </div>
      <div @click="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
      <div class="FeedButtons">
        <div class="FeatherIcon">
          <vue-feather class="MarginLeft" type="alert-octagon" v-if="feed.isError" />
        </div>
      </div>
    </div>
    !-->
  </div>
</template>

<style scoped>
.FeedTile {
  border-radius: 0px;
  position: relative;
  width: 80px;
  height: 80px;
  padding: 4px;
  background-color: var(--main-text);
  color: var(--main-bg);
  margin: 0px 30px 30px 0px;
  cursor: pointer;
  transition: all ease 0.2s;
  /* box-shadow: 4px 4px 0px var(--main-text); */
  /* box-shadow: 0 0 5px rgba(255,255,255,.9); */
  box-shadow: 0px 5px 10px 0px rgba(0,255,255,0.7);
}

.FeedTile:hover {
  transform: scale(1.2) translateY(-5px);
  box-shadow: 0px 10px 20px 2px rgba(0,255,255,0.7);
  /* box-shadow: 2px 2px 0px var(--main-text);   */
  /* box-shadow: 0 0 11px rgba(255,255,255,.9); */
}

.FeedTitle {
  color: var(--nice-red);
  font-size: 16px;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  font-family: Helvetica;
  text-align: center;
  margin-top: 15px;
  transform: scale(1.5) rotate(-10deg);
}

.EditButton {
  display: none;
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 16px;
}

.FeedTile:hover .EditButton {
  display: block;
}

</style>
