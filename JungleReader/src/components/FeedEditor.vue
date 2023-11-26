<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import CollapsingHeader from './CollapsingHeader.vue'
import OptionsInput from './OptionsInput.vue'
import GroupSelector from './GroupSelector.vue'
import BasicSelector from './BasicSelector.vue'
import CopyLinkButton from './CopyLinkButton.vue'
import InfoTooltip from './InfoTooltip.vue'

const props = defineProps({
  feed: {
    type: Object,
  }
});

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
  return Feed.makeShareLink(props.feed.name, props.feed.type, props.feed.url);
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
    <input v-model="feed.name" class="Block BasicTextInput WideInput" autofocus>
    <div class="FormFieldName">Group</div>
    <GroupSelector v-if="feed" :currentGroup="feed.parentGroup" @change="changeGroup"/>
  </div>
  <div class="FormFieldName">Feed Type</div>
  <div class="Flex FeedTypeBox">
    <BasicSelector :value="feed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(feed, newVal)"/>
    <!-- <button class="SmallButton" @click="showQuickHelp = !showQuickHelp">Info</button> -->
  </div>
  <!-- <p v-if="showQuickHelp" class="QuickHelpText">{{getQuickHelp(feed.type)}}</p> -->
  <div class="FormFieldNameWithInfo">Feed URL</div>
  <div class="FormFieldInfo">{{ getUrlPlaceholder(feed) }}</div>
  <input v-model="feed.url" class="Block BasicTextInput WideInput">

  <div class="FormFieldName">Custom Options</div>
  <OptionsInput class="" :options="feed.options" />

  <CopyLinkButton title="Get share link" class="ShareLink" :theLink="feedShareLink" />

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

.ShareLink {
  margin-top: var(--space-m);
}
</style>
