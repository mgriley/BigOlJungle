<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
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
    'font-family': getItemFromStyleId(availableFonts, props.feed.styleId),
  };
});

</script>

<template>
  <div class="FeedTile" :style="tileStyle" @click="onFeedClicked(feed)">
    <div class="FeedTitle" :style="titleStyle">
      {{ feed.name ? feed.name : "NoName" }}
    </div>
    <div class="Details">
    Hello World
    </div>
    <div @click.stop="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
  </div>
</template>

<style scoped>
.FeedTile {
  position: relative;
  width: var(--feed-tile-width);
  height: var(--feed-tile-height);
  padding: 6px;
  cursor: pointer;
  transition: all 0.1s ease;
  overflow: hidden;
  z-index: 0;

  /* background-color: var(--bg-color); */
  /* box-shadow: var(--box-shadow); */

  border-radius: 4px;
  border: 2px solid var(--main-text);
  box-shadow: 8px 8px 8px color-mix(in srgb, var(--primary-color), transparent 30%);
  /* box-shadow: 8px 8px 8px color-mix(in srgb, var(--nice-red), transparent 30%); */
}

.FeedTile:hover {
  /* transform: scale(1.2) translateY(-5px) rotate(5deg); */
  transform: scale(1.2) translateY(-5px);
  /* box-shadow: 0 4 10px 4px color-mix(in srgb, var(--bg-color), transparent 30%); */
  box-shadow: none;
  z-index: 1;
}

.FeedTitle {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
  text-align: center;
  margin-top: 5px;
  transform: rotate(-8deg);
}

.Details {
  font-size: 20px;
  font-weight: 600;
  margin-top: 15px;
  margin-left: 10px;
}

.EditButton {
  display: none;
  position: absolute;
  right: var(--space-xxs);
  bottom: var(--space-xxs);
  font-size: var(--p-size);
  padding: 4px 8px;
  background-color: var(--dark-color);
}

.FeedTile:hover .EditButton {
  display: block;
}

</style>
