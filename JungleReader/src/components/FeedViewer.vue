<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import * as utils from '../Utils.js'
import TreeIcon from './TreeIcon.vue'
import BasicModal from 'Shared/BasicModal.vue'
import FeedEditor from './FeedEditor.vue'

const props = defineProps({
  feed: Object,
})

let maxLinkContentLen = 150;
let lastReadTime = ref(0);
let feedEditorModal = ref(null);

function goBack() {
  gApp.router.go(-1);
}

function isLinkNew(link) {
  let pubTime = (new Date(link.pubDate)).getTime();
  return pubTime > lastReadTime.value;
}

function deleteFeed() {
  props.feed.removeFromParent();
  goBack();
}

onMounted(() => {
  lastReadTime.value = props.feed.lastReadTime;
  props.feed.markAsRead();  
})

</script>

<template>
  <div class="FeedViewer">
    <button class="BackButton" @click="goBack">Back to Home</button>
    <div class="HeaderBox">
      <h1 class="FeedName">{{ feed.name }}</h1>
      <div class="Subtitle">
        <a v-if="feed.mainSiteUrl" :href="feed.mainSiteUrl" class="LinkButton InlineBlock SubtitleText MarginBotXS" target="_blank">
          {{ feed.mainSiteUrl }}
        </a>
        <div v-if="feed.lastReloadTime" class="SubtitleText">Last Reloaded: {{ feed.lastReloadTimeStr() }}</div>
        <div class="ButtonRow Flex">
          <button class="ReloadButton SmallButton" @click="feed.reload()">
            <vue-feather type="rotate-cw" stroke-width="1.5" class="Icon"/>
            Reload now
          </button>
          <button class="SmallButton" @click="feedEditorModal.showModal()">
            <vue-feather type="edit" stroke-width="1.5" class="Icon"/>
            Edit feed
          </button>
        </div>
      </div>
    </div>
    <Transition name="Reload">
      <div v-if="feed.isReloading()" class="ReloadIndicator">
        <h4>Reloading...</h4>
      </div>
    </Transition>
    <template v-if="!feed.isError">
      <div class="LinkList">
        <template v-if="feed.links.length > 0">
          <template v-for="link in feed.links" :id="link.id">
            <div class="LinkElem" :class="{IsNew: isLinkNew(link)}">
              <div class="LinkContentBox">
                <!-- <p class="LinkText"> -->
                  <a :href="link.link" target="_blank" class="LinkText">
                    {{ link.getTrimmedStringDesc(maxLinkContentLen) }}
                  </a>
                <!-- </p> -->
                <button v-if="link.textLenExceeds(maxLinkContentLen)" class="SmallButton ShowMoreBtn" @click="link.textExpanded = !link.textExpanded">{{ link.textExpanded ? 'Show less' : 'Show more'}}</button>
              </div>
              <div class="SubInfo">
                <span v-if="link.extraDataString" class="ExtraString">{{ link.extraDataString }}</span>
                <span v-if="link.pubDate" class="DaysAgo">{{ utils.getTimeAgoStr(new Date(link.pubDate)) }}</span>
              </div>
              <div v-if="isLinkNew(link)" class="NewIndicator">
                New
                <vue-feather type="activity" size="20" stroke-width="3" />
              </div>
            </div>
          </template>
        </template>
        <template v-else>
          <p class="NothingHereYet">Nothing here yet. Do a reload.</p>
        </template>
      </div>
    </template>
    <template v-else>
      <div class="Link ErrorText">
        <h4>Error reloading feed</h4>
        <p>{{ feed.errorMsg }}</p>
      </div>
    </template>
    <BasicModal class="FeedEditorModal" ref="feedEditorModal" :showCancel="false" title="Edit Feed">
      <FeedEditor :feed="feed" />
      <button class="DeleteButton SmallButton" @click="deleteFeed">Delete Feed</button>
    </BasicModal>
  </div>
</template>

<style scoped>
.FeedViewer {
  position: relative;
}

.FeedName {
  line-height: 1;
  margin-bottom: var(--space-s);
  text-decoration: underline solid var(--brand-color-purple) 6px;
  /* text-decoration: none; */
}

.HeaderBox {
  margin-bottom: var(--space-l);
}

.ButtonRow {
  margin-top: 8px;
  margin-bottom: 4px;
  gap: 24px;
}

.ButtonRow button {
  margin-top: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ButtonRow .Icon {
  color: var(--brand-color-yellow);
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

.ReloadIndicator {
  margin-bottom: var(--space-xs);
  /* animation: createBox .5s; */
}

@keyframes createBox {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.ErrorIndicator {
  color: red;
}

.ErrorText {
}

.LinkList {
  transition: all 1 ease;  
  border: var(--link-list-border);
  border-radius: var(--pane-border-radius);
}

.LinkElem {
  position: relative;
  border-bottom: var(--link-list-border);
  /* padding: var(--space-s); */
  padding: var(--space-s);
  /*margin-bottom: var(--space-xs);*/
}

.LinkElem.IsNew {
  border-left: 8px solid var(--nice-red);
  /*border-left: 8px solid var(--brand-color-yellow);*/
}

.LinkElem:last-child {
  border-bottom: none;
}

.LinkContentBox {
}

.LinkTitle {
  display: none;
  font-size: 20px;
  font-weight: var(--bold-weight);
  color: var(--main-text);
}

.LinkText {
  display: block;
  text-decoration: none;
  white-space: pre-wrap;
  line-height: 1.5;
  /* font-size: 20px; */
}

.LinkText:hover, .LinkText:active {
  background-color: inherit;
  color: inherit;
  text-decoration: underline;
}

.LinkElem .SubInfo {
  display: flex;
  align-items: baseline;
  /*color: var(--mute-text);*/
  font-size: var(--small-size);
  font-weight: var(--bold-weight);
  margin-top: var(--space-xs);
}

.LinkElem.IsNew .SubInfo {
  font-size: var(--p-size);
}

.ShowMoreBtn {
  font-size: var(--small-size);
  color: var(--white-color);
}

.ShowMoreBtn:hover,.ShowMoreBtn:active {
  color: var(--main-bg);
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

.NewIndicator {
  position: absolute;
  top: -16px;
  right: -14px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 4px;

  background-color: var(--nice-red);
  padding: 2px 8px;
  font-size: calc(var(--smaller-size) * 0.95);

  border: 6px solid var(--main-bg);
  border-radius: 8px;

  color: var(--main-bg);
  font-weight: var(--bold-weight);
}

.NothingHereYet {
  font-size: var(--h4-size);
  padding: 8px;
}

.DeleteButton {
  margin-top: var(--space-l);
}

.Reload-enter-active,
.Reload-leave-active {
  transition: opacity 0.25s ease;
}

.Reload-enter-from {
  opacity: 1;
}

.Reload-leave-to {
  opacity: 0;
}

/*
.Reload-enter-from,
.Reload-leave-to {
  opacity: 0;
}
*/

</style>
