<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import * as utils from '../Utils.js'
import TreeIcon from './TreeIcon.vue'

const props = defineProps({
  feed: Object,
})

function goBack() {
  gApp.router.go(-1);
}

</script>

<template>
  <div class="FeedViewer">
    <button class="BackButton" @click="goBack">Back to Home</button>
    <div class="HeaderBox">
      <div class="FeedNameBox">
        <h1 class="FeedName">{{ feed.name }}</h1>
        <div class="Subtitle">
          <a v-if="feed.mainSiteUrl" :href="feed.mainSiteUrl" class="LinkButton InlineBlock SubtitleText MarginBotXS" target="_blank">
            {{ feed.mainSiteUrl }}
          </a>
          <div v-if="!feed.reloading" class="ReloadInfo">
            <div v-if="feed.lastReloadTime" class="SubtitleText MarginBotXS">Last Reload: {{ utils.getTimeAgoStr(feed.lastReloadTime, {enableMins: true}) }}</div>
            <button class="SmallButton ReloadButton" @click="feed.reload()">Reload now</button>
          </div>
          <div v-else class="SubtitleText">
            Reloading...
          </div>
        </div>
      </div>
    </div>
    <template v-if="!feed.isError">
      <div class="LinkList">
        <div class="LinkElem" v-for="link in feed.links" :id="link.id">
          <p class="LinkText">
            <a :href="link.link" target="_blank" class="LinkText">
              <!-- {{ link.getTrimmedStringDesc(150) }} -->
              {{ link.getTrimmedStringDesc(150) }}
            </a>
          </p>
          <div class="SubInfo">
            <span v-if="link.extraDataString" class="ExtraString">{{ link.extraDataString }}</span>
            <span class="DaysAgo">{{ utils.getTimeAgoStr(new Date(link.pubDate)) }}</span>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="Link ErrorText">
        <p>{{ feed.errorMsg }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.FeedViewer {
  position: relative;
  max-width: 720px;
}

.FeedNameBox {
  margin-bottom: 16px;
}

.FeedName {
  line-height: 1;
  margin-bottom: var(--space-s);
}

.FeedNameBox .Subtitle {
  margin-bottom: var(--space-xl);
}

.SubtitleText {
  font-size: var(--small-size);
  color: var(--secondary-text);
  /* font-weight: var(--bold-weight); */
  /* font-style: italic; */
}

.ReloadInfo {
  /*
  display: flex;
  align-items: baseline;
  gap: var(--space-m);
  */
}

.ReloadButton {
  margin: 0;
  padding: 0;
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

  border: 1px solid var(--main-text);
  border-radius: var(--border-radius-small);
  /* padding: 8px 12px; */
  padding: var(--space-s);
  margin-bottom: var(--space-m);
}

.LinkText {
  text-decoration: none;
}

.LinkElem .SubInfo {
  display: flex;
  /*color: var(--mute-text);*/
  font-size: var(--small-size);
  font-weight: var(--bold-weight);
  font-style: italic;
  margin-top: var(--space-xs);
}

.ExtraString {
  margin-right: 16px;
}

.DaysAgo {
}

.FeedButtons {
  display: flex;
}

.BackButton {
  float: right;
}

.HeaderBox {
  margin-bottom: var(--space-l);
}

</style>
