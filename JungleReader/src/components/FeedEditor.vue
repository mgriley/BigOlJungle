<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import CollapsingHeader from './CollapsingHeader.vue'
import OptionsInput from './OptionsInput.vue'
import GroupSelector from './GroupSelector.vue'
import BasicSelector from './BasicSelector.vue'
import LinkSnippet from './LinkSnippet.vue'
import InfoTooltip from './InfoTooltip.vue'

const props = defineProps({
  feed: {
    type: Object,
  }
});

const dummyFeed = new Feed(0);

const realFeed = computed(() => {
  return props.feed ? props.feed : dummyFeed;
})

function changeGroup(newGroup) {
  props.feed.moveToGroup(newGroup);  
}

let showOptions = ref(false);
let showQuickHelp = ref(false);

let supportedFeedTypes = computed(() => {
  let types = []
  for (const plugin of gApp.feedPlugins) {
    types.push(plugin.name);
  }
  for (const plugin of gApp.customPlugins) {
    types.push(plugin.feedType);
  }
  return types;
})

function onChangeFeedType(feed, newType) {
  console.log("Cur type: " + feed.type + ". New feed type: " + newType);
  feed.type = newType;
  // console.log("Feed type: " + feed.type);
}

const feedShareLink = computed(() => {
  let feed = props.feed ? props.feed : dummyFeed
  return Feed.makeShareLink(feed.name, feed.type, feed.url);
})

function getUrlPlaceholder(feed) {
  let plugin = gApp.getFeedPluginByType(feed.type);
  if (!plugin) {
    return "No help available.";
  }
  return plugin.urlPlaceholderHelp;
}

function getQuickHelp(pluginType) {
  let plugin = gApp.getFeedPluginByType(pluginType);
  if (!plugin) {
    return null;
  }
  return plugin.quickHelpDocs;
}

</script>

<template>
  <div class="FeedHeader">
    <div class="FormFieldName">Name</div>
    <input v-model="realFeed.name" class="Block BasicTextInput WideInput" autofocus>
    <div class="FormFieldName">Group</div>
    <GroupSelector v-if="feed" :currentGroup="realFeed.parentGroup" @change="changeGroup"/>
  </div>
  <div class="FormFieldName">Feed Type</div>
  <div class="Flex FeedTypeBox">
    <BasicSelector :value="realFeed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(realFeed, newVal)"/>
    <button class="SmallButton" @click="showQuickHelp = !showQuickHelp">Info</button>
  </div>
  <p v-if="showQuickHelp" class="QuickHelpText">{{getQuickHelp(realFeed.type)}}</p>
  <!-- <p>{{ feed.type }}</p> -->
  <div class="FormFieldNameWithInfo">Feed URL</div>
  <div class="FormFieldInfo">{{ getUrlPlaceholder(realFeed) }}</div>
  <input v-model="realFeed.url" class="Block BasicTextInput WideInput">

  <div class="FormFieldName">Custom Options</div>
  <OptionsInput :options="realFeed.options" />

  <div class="FormFieldName">Share Link</div>
  <LinkSnippet :theLink="feedShareLink" />

  <!-- <button @click="realFeed.changeStyleId()" class="SmallButton Block MarginTop FormFieldItem">Regen Style</button> -->
</template>

<style scoped>
.FeedHeader {
  /* display: flex; */
}

.FeedTypeBox {
  gap: 8px;
}

.QuickHelpText {
  max-width: 400px;
  line-height: 1.2;
}

.WideInput {
  width: 30ch;
  max-width: 100%;
}
</style>
