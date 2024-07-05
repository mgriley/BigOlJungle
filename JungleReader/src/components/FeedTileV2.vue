<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import * as utils from '../Utils.js'

const props = defineProps({
  feed: Object,
})

const emit = defineEmits(['editFeed'])

function removePrefix(name, prefix) {
  if (name.startsWith(prefix)) {
    return name.slice(prefix.length);
  }
  return name;
}

function getLetterLogo(feed) {
  if (!feed.name) {
    return '?'
  }
  let name = feed.name;
  name = removePrefix(name, '/');
  name = removePrefix(name, 'r/');
  name = removePrefix(name, '@');
  name = removePrefix(name, 'www.');
  return name.substring(0, 1).toUpperCase();
  // return feed.name.substring(0, 1).toLowerCase();
}

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
    <div class="BgImgV2">
      <img class="Favicon" :src="feed.getFavicon()" />
      <p class="LogoLetter">{{getLetterLogo(feed)}}</p>
    </div>
    <div class="FeedTextContainer">
      <div class="FeedText">
        <div class="FeedTitle">
          {{ feed.name ? feed.name : "NoName" }}
          <vue-feather class="BookmarkIcon" v-if="feed.type == 'Bookmark'" type="external-link" size="22" />
        </div>
        <template v-if="!feed.isReloading()">
          <div class="Details">
            <!-- <p class="LastUpdate">Last update</p> -->
            <p class="UpdateDaysAgo">{{ feed.mostRecentLinkTimeStr() }}</p>
          </div>
        </template>
        <template v-else>
          <p class="ReloadingText">Reloading...</p>
        </template>
        <div v-if="feed.hasUnreadContent()" class="UnreadIcon">
          <!-- <p class="Asterisk"><vue-feather type="bell" size="16" /></p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.FeedTile {
  position: relative;
  display: flex;
  flex-flow: column nowrap;

  /* width: 120px; */
  width: 140px;
  height: 90px;

  /* padding: var(--space-xxs) var(--space-xs); */
  padding: var(--space-xs) var(--space-xs);
  cursor: pointer;
  transition: all 0.1s ease;
  /* overflow: hidden; */
  z-index: 0;

  background-color: var(--main-bg);
  /* border-radius: var(--border-radius-small); */
  /* border: 1px solid var(--main-text); */
  /* border: 1px solid var(--brand-color-b); */

  border: 1px solid rgba(255, 255, 255, 0.2);
  /* border: 1px solid grey; */
  border-radius: 8px;
}

.BgImg {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  /* justify-content: start; */
  width: 100%;
  height: 100%;
}

.BgImgV2 {
  position: relative;
  display: flex;
}

.Favicon {
  position: absolute;
  top: 0;
  right: 0;
  width: 18px;
  height: 18px;
}

.LogoLetter {
  margin: 0 auto;
  margin-bottom: -12px;
  font-size: 48px;
  font-weight: bold;
  line-height: 1;

  /* color: white; */
  /* opacity: 0.4; */

  color: transparent;
  -webkit-text-stroke: 1px var(--brand-color-yellow);
  /* text-stroke: 1px grey; */

  /* font-family: 'Arial Black'; */
  font-family: sans-serif;
  /* color: var(--brand-color-yellow); */
  z-index: -1;
}

@media (hover: hover) {
  .FeedTile:hover {
    /* transform: scale(1.2) translateY(-5px); */
    transform: scale(1.2) translateY(-5px);
    box-shadow: none;
    z-index: 1;
  }
}

.FeedTextContainer {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

.FeedText {
  margin-top: auto;
}

.FeedTitle {
  /* font-size: var(--p-size); */
  /* font-size: var(--small-size); */
  margin-top: auto;
  /* font-size: var(--small-size); */
  font-weight: var(--bold-weight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;

  font-size: var(--xs-size);
  font-weight: normal;
  letter-spacing: -1px;

  text-decoration-line: underline;
  text-decoration-color: DeepPink;
  text-decoration-thickness: 2px;
}

.BookmarkIcon {
  color: var(--secondary-text);
  position: relative;
  top: 2px;
}

.FeedTile.Reloading {
  /* border-color: red; */
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
  font-size: var(--xxs-size);
  color: var(--main-text);
  text-align: center;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.FeedTile.HasUnread {
  border: 2px solid DeepPink;
}

.FeedTile.HasUnread .LogoLetter {
  /* color: DeepPink; */
  /* color: var(--attn-color); */
  -webkit-text-stroke: 0;
  color: white;
  text-shadow: 2px 2px DeepPink;
  opacity: 1;
}

.FeedTile.HasUnread .FeedTitle {
  font-weight: bold;
}

.FeedTile.HasUnread .UpdateDaysAgo {
  /* font-weight: bold; */
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

@media (max-width: 768px) {
}

.UnreadIcon {
  display: none;
  --width: 18px;
  position: absolute;
  z-index: 1;
  width: var(--width);
  height: var(--width);
  top: calc(var(--width) * -0.5);
  right: calc(var(--width) * -0.5);
  background-color: DeepPink; 
  /* border-radius: calc(var(--width) / 2); */

  border: 4px solid var(--main-bg);
  border-radius: 6px;
}

</style>
