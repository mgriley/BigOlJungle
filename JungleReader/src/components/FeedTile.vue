<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import * as utils from '../Utils.js'
import TreeIcon from './TreeIcon.vue'

const props = defineProps({
  feed: Object,
})

const emit = defineEmits(['editFeed'])

function onFeedClicked(feed) {
  if (feed.type == "Bookmark") {
    window.open(utils.cleanUrl(feed.url), "_blank").focus();
  } else {
    feed.reloadIfStale();
    gApp.router.push({name: 'feed', params: {id: feed.id}})
  }
}

</script>

<template>
  <div class="FeedTile" :class="{Reloading: feed.isReloading(), HasUnread: feed.hasUnreadContent()}" @click="onFeedClicked(feed)">
    <div class="FeedTitle">
      {{ feed.name ? feed.name : "NoName" }}
      <vue-feather class="BookmarkIcon" v-if="feed.type == 'Bookmark'" type="external-link" size="22" />
    </div>
    <template v-if="!feed.isReloading()">
      <div class="Details">
        <p class="LastUpdate">Last update</p>
        <p class="UpdateDaysAgo">{{ feed.mostRecentLinkTimeStr() }}</p>
      </div>
      <div @click.stop="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
    </template>
    <template v-else>
      <p class="ReloadingText">Reloading...</p>
    </template>
    <div v-if="feed.hasUnreadContent()" class="UnreadIcon">
      <!-- <p class="Asterisk"><vue-feather type="bell" size="16" /></p> -->
    </div>
  </div>
</template>

<style scoped>
.FeedTile {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  width: var(--feed-tile-width);
  height: var(--feed-tile-height);
  padding: var(--space-xs);
  cursor: pointer;
  transition: all 0.1s ease;
  /* overflow: hidden; */
  z-index: 0;

  background-color: var(--main-bg);
  border-radius: var(--border-radius-small);
  /* border: 1px solid var(--main-text); */
  border: 1px solid var(--brand-color-b);
}

.FeedTile:hover {
  /* transform: scale(1.2) translateY(-5px); */
  transform: scale(1.2) translateY(-5px);
  box-shadow: none;
  z-index: 1;
}

.FeedTitle {
  font-size: var(--p-size);
  font-weight: var(--bold-weight);
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  text-align: left;
}

.BookmarkIcon {
  color: var(--secondary-text);
  position: relative;
  top: 2px;
}

.FeedTile.Reloading {
  /* border-color: red; */
}

.FeedTile.HasUnread {
  border-color: var(--attn-color);
  border-width: 3px;
}

.Details {
  margin-top: auto;
  font-size: var(--small-size);
}

.Details p {
  line-height: 1.1;
}

.LastUpdate {
  font-size: calc(var(--small-size) * 0.7);
  color: var(--light-color);
}

.UpdateDaysAgo {
  font-size: calc(var(--small-size) * 0.9);
  color: var(--main-text);
}

.FeedTile.HasUnread .UpdateDaysAgo {
  font-weight: bold;
}

.EditButton {
  display: none;
  position: absolute;
  /*
  right: var(--space-xxs);
  bottom: var(--space-xxs);
  */
  right: 0;
  bottom: 0;
  font-size: var(--small-size);
  font-weight: normal;
  padding: 8px 12px;

  background-color: var(--medium-color);
  /* color: var(--secondary-text); */

  /* background-color: var(--main-text); */
  /* color: var(--darkest-color); */

  /* border-radius: var(--border-radius-small); */
}

.EditButton:hover {
}

.FeedTile:hover .EditButton {
  display: block;
}

.ReloadIndicator {
}

.ReloadingText {
  margin-top: auto;
  padding: 4px 8px;
  font-size: var(--small-size);
  color: var(--main-bg);
  font-weight: var(--bold-weight);
  text-transform: uppercase;
  background-color: var(--brand-color-b);
  border-radius: 2px;
}

/*
.Reload-enter-active, .Reload-leave-active {
  transition: opacity 1s ease;
}

.Reload-enter-from, .Reload-leave-to {
  opacity: 0;
}
*/

.UnreadIcon {
  --width: 22px;
  position: absolute;
  z-index: 1;
  width: var(--width);
  height: var(--width);
  top: calc(var(--width) * -0.5);
  right: calc(var(--width) * -0.5);
  background-color: var(--attn-color); 
  /* border-radius: calc(var(--width) / 2); */

  border: 4px solid var(--main-bg);
  border-radius: 6px;
}

</style>
