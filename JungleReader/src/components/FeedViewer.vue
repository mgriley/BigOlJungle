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
    <button class="BackBtn" @click="goBack">Back to Feed</button>
    <div class="HeaderBox">
      <div class="FeedNameBox">
        <div class="FeedName">{{ feed.name }}</div>
        <div class="Subtitle">
          <a v-if="feed.mainSiteUrl" :href="feed.mainSiteUrl" class="" target="_blank">
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
      <ol class="LinkList">
        <li v-for="link in feed.links" :id="link.id" class="LinkElem">
          <div>
            <a :href="link.link" target="_blank">
              {{ link.getTrimmedStringDesc(150) }}
            </a>
          </div>
          <div class="SubInfo">
            <span v-if="link.extraDataString" class="ExtraString">{{ link.extraDataString }}</span>
            <span class="DaysAgo">{{ utils.getTimeAgoStr(new Date(link.pubDate)) }}</span>
          </div>
        </li>
      </ol>
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
  line-height: 1.5;
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

.LinkList li::marker {
  font-size: 1.5rem;
  font-weight: 700;
}

.LinkList li {
  margin-bottom: 20px;
}

.LinkElem {
  /*
  max-width: 1000px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  */
  /* line-height: 1; */
  font-size: 1.5rem;
  line-height: 1.3;

}

.LinkElem .SubInfo {
  display: flex;
  //color: var(--mute-text);
  font-size: 1.25rem;
  font-weight: 800;
  font-style: italic;
  line-height: 1.25;
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
  margin-bottom: 40px;
}

.HeaderBox {
  margin-bottom: 30px;
}

</style>
