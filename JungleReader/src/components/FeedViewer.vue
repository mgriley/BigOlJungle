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
      <div class="FeedName">
        <div>{{ feed.name }}</div>
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
    <template v-if="!feed.isError">
      <ul v-for="link in feed.links" :id="link.id" class="Link">
        <li class="LinkElem">
          <a :href="link.link" target="_blank">
            {{ link.getTrimmedStringDesc() }}
          </a>
          <span v-if="link.extraDataString" class="ExtraString">({{ link.extraDataString }})</span>
          <span class="DaysAgo">{{ "(" + utils.getTimeAgoStr(new Date(link.pubDate)) + ")" }}</span>
        </li>
      </ul>
    </template>
    <template v-else>
      <div class="Link ErrorText">
        <p>{{ feed.errorMsg }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
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

.BackBtn {
  margin-bottom: 40px;
}

.HeaderBox {
  margin-bottom: 30px;
}

</style>
