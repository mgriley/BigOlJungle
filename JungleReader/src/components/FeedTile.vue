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
    window.open(feed.url, "_blank").focus();
  } else {
    feed.reloadIfStale();
    gApp.router.push({name: 'feed', params: {id: feed.id}})
  }
}

function getItemFromStyleId(list, styleId) {
  return list[styleId % list.length];
}

const tileStyle = computed(() => {
  // See: https://www.w3schools.com/colors/colors_names.asp
  /*
  let colors = [
    'red',
    'Tomato',
    'Orange',
    'DodgerBlue',
    'SlateBlue',
    'Violet',
    'MediumSeaGreen',
    'black',
    'blue',
    'Brown',
    'CadetBlue',
    'CornflowerBlue',
    'Crimson',
    'DarkOliveGreen',
    'DarkRed',
    'DarkOrange',
    'DarkSlateGrey',
    'ForestGreen',
    'GoldenRod',
    'IndianRed',
    'MidnightBlue',
    'OliveDrab',
  ];
  */
  let colors = [
    'IndianRed',
    'CornflowerBlue',
  ];
  let bgColor = getItemFromStyleId(colors, props.feed.styleId);
  return {
    '--test-color': 'red',
    '--bg-color': bgColor,
    //'box-shadow': `4px 4px 8px ${bgColor}`,
    // 'box-shadow': `0px 2px 12px 2px color-mix(in srgb, ${bgColor}, transparent 30%)`,
    '--box-shadow': `8px 8px 8px color-mix(in srgb, ${bgColor}, transparent 30%)`,
    // 'box-shadow': `4px 4px 0px var(--main-text)`,
  }
});

const titleStyle = computed(() => {
  let availableFonts = [
    'Helvetica',
    'Arial',
    'Arial Black',
    //'Impact',
    'Verdana',
    'Tahoma',
    'Trebuchet MS',
    'Gill Sans',
    'Optima',
  ];
  /*
  availableFonts += [
    'Baskerville',
  ];
  */
  return {
    // 'font-family': getItemFromStyleId(availableFonts, props.feed.styleId),
  };
});

</script>

<template>
  <div class="FeedTile" :class="{Reloading: feed.isReloading(), HasUnread: feed.hasUnreadContent()}" :style="tileStyle" @click="onFeedClicked(feed)">
    <div class="FeedTitle" :style="titleStyle">
      {{ feed.name ? feed.name : "NoName" }}
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

  border-radius: var(--border-radius-small);
  border: 1px solid var(--main-text);
}

.FeedTile:hover {
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

.FeedTile.Reloading {
  /* border-color: red; */
}

.FeedTile.HasUnread {
  /*
  border-color: var(--nice-red);
  border-width: 2px;
  */
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

  /* border: 1px solid var(--main-text); */
  /* border-radius: var(--border-radius-small); */
}

.EditButton:hover {
  /* color: var(--nice-red); */
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
  color: var(--main-text);
  background-color: var(--medium-color);
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
  --width: 24px;
  position: absolute;
  z-index: 1;
  width: var(--width);
  height: var(--width);
  top: calc(var(--width) * -0.5);
  right: calc(var(--width) * -0.5);
  background-color: var(--nice-red); 
  border-radius: calc(var(--width) / 2);

  /*
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  */
}

.Asterisk {
  /*
  height: 100%;
  font-size: var(--p-size);
  font-weight: var(--bold-weight);
  color: var(--main-text);
  line-height: 36px;
  transform: rotate(20deg);
  */
}

</style>
