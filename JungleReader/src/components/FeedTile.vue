<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import TreeIcon from './TreeIcon.vue'
import EditButton from './EditButton.vue'

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
  return {
    'background-color': getItemFromStyleId(colors, props.feed.styleId),
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
      {{ feed.name }}
    </div>
    <div class="Details">
    Hello World
    </div>
    <div @click.stop="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
    <!--
    <div class="FeedControls">
      <div class="FeedTitleBar" @click="onFeedClicked(feed)">
        <div class="FeedName TextButton">{{ feed.name }}</div>
      </div>
      <div @click="(evt) => emit('editFeed', feed, evt)" class="EditButton TextButton">edit</div>
      <div class="FeedButtons">
        <div class="FeatherIcon">
          <vue-feather class="MarginLeft" type="alert-octagon" v-if="feed.isError" />
        </div>
      </div>
    </div>
    !-->
  </div>
</template>

<style scoped>
.FeedTile {
  border-radius: 0px;
  border: 4px dotted var(--main-text);
  position: relative;
  width: 180px;
  height: 140px;
  padding: 6px;
  /* background-color: var(--main-text); */
  /* color: var(--main-bg); */
  margin: 0px 30px 30px 0px;
  cursor: pointer;
  transition: all ease 0.2s;
  overflow: hidden;
  /* box-shadow: 4px 4px 0px var(--main-text); */
  /* box-shadow: 0 0 5px rgba(255,255,255,.9); */
  /* box-shadow: 0px 5px 10px 0px rgba(0,255,255,0.7); */
}

.FeedTile:hover {
  transform: scale(1.2) translateY(-5px) rotate(5deg);
  /* box-shadow: 0px 10px 20px 2px rgba(0,255,255,0.7); */
  /* box-shadow: 2px 2px 0px var(--main-text);   */
  /* box-shadow: 0 0 11px rgba(255,255,255,.9); */
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
  right: 4px;
  bottom: 4px;
  font-size: 20px;
  padding: 0 2px;
  background-color: var(--main-bg);
}

.FeedTile:hover .EditButton {
  display: block;
}

</style>
