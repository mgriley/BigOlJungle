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
    <button class="BackBtn" @click="goBack">Back to Home</button>
    <div class="HeaderBox">
      <div class="FeedNameBox">
        <div class="FeedName">{{ feed.name }}</div>
        <div class="Subtitle">
          <a v-if="feed.mainSiteUrl" :href="feed.mainSiteUrl" class="LinkButton" target="_blank">
            {{ feed.mainSiteUrl }}
          </a>
          <div v-if="!feed.reloading">
            <div v-if="feed.lastReloadTime">Last Reload: {{ utils.getTimeAgoStr(feed.lastReloadTime, {enableMins: true}) }}</div>
            <button @click="feed.reload()">Reload</button>
          </div>
          <div v-else>
            Reloading...
          </div>
        </div>
      </div>
    </div>
    <template v-if="!feed.isError">
      <div class="LinkList">
        <div class="LinkElem" v-for="link in feed.links" :id="link.id">
          <div>
            <a :href="link.link" target="_blank" class="LinkText">
              {{ link.getTrimmedStringDesc(150) }}
            </a>
          </div>
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
}

.FeedNameBox {
  margin-bottom: 15px;
}

.FeedName {
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: -3px;
  line-height: 1;
}

.FeedNameBox .Subtitle {
  font-size: 1rem;
  font-weight: 600;
  font-style: italic;
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
  font-size: 1.5rem;
  line-height: 1.3;

  border: 2px solid var(--main-text);
  padding: 5px 10px;
  margin-bottom: 20px;

  box-shadow: 4px 4px 0px var(--main-text);
}

.LinkText {
  font-weight: 500;
}

.LinkElem .SubInfo {
  display: flex;
  /*color: var(--mute-text);*/
  font-size: 1.25rem;
  font-weight: 800;
  font-style: italic;
  margin: 5px 0;
}

.ExtraString {
  margin-right: 15px;
}

.Bullet {
  margin-right: 10px;
}

.DaysAgo {
}

.FeedButtons {
  display: flex;
}

.BackBtn {
  float: right;
}

.HeaderBox {
  margin-bottom: 30px;
}

</style>
