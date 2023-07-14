<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'

const props = defineProps({
  feed: Object,
})

</script>

<template>
  <div class="FeedView">
    <div class="FeedName Flex">
      <div>{{ feed.name }}</div>
      <a :href="feed.mainSiteUrl" class="MarginLeft" target="_blank">
        <vue-feather class="FeatherIcon" type="external-link"/>
      </a>
    </div>
    <template v-if="!feed.isError">
      <ul v-for="link in feed.links" :id="link.id" class="Link">
        <li class="LinkElem">
          <a :href="link.link" target="_blank">
            {{ link.getTrimmedStringDesc() }}
          </a>
          <span v-if="link.extraDataString" class="ExtraString">({{ link.extraDataString }})</span>
          <span class="DaysAgo">{{ "(" + getTimeAgoStr(new Date(link.pubDate)) + ")" }}</span>
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

</style>
