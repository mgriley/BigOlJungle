<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import CollapsingHeader from './CollapsingHeader.vue'
import OptionsInput from './OptionsInput.vue'
import GroupSelector from './GroupSelector.vue'
import BasicSelector from './BasicSelector.vue'
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
let showQuickHelp = ref(true);

let supportedFeedTypes = computed(() => {
  let types = []
  for (const plugin of gApp.feedPlugins) {
    types.push(plugin.name);
  }
  for (const plugin of gApp.customPlugins) {
    if (plugin.feedType) {
      types.push(plugin.feedType);
    }
  }
  return types;
})

function onChangeFeedType(feed, newType) {
  console.log("Cur type: " + feed.type + ". New feed type: " + newType);
  feed.type = newType;
  // console.log("Feed type: " + feed.type);
}

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
    <input v-model="feed.name" class="Block BasicTextInput" autofocus placeholder="Enter name">
  </div>
  <div class="FormFieldName">Type</div>
  <div class="Flex FeedTypeBox">
    <BasicSelector :value="feed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(feed, newVal)"/>
    <!-- <button class="SmallButton InfoButton" @click="showQuickHelp = !showQuickHelp">Info</button> -->
  </div>
  <p v-if="showQuickHelp" class="QuickHelpText">{{getQuickHelp(feed.type)}}</p>
  <div class="FormFieldName">URL</div>
  <!-- <BasicSelector class="MarginBotXXS" :value="feed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(feed, newVal)"/> -->
  <input v-model="feed.url" class="Block BasicTextInput WideInput" placeholder="Enter URL">
  <div class="FormFieldInfoUnder">{{ getUrlPlaceholder(feed) }}</div>

  <details class="Settings FormFieldName CursorPointer">
    <summary class="CursorPointer">More Settings</summary>
    <div class="SettingsBody">
      <div class="FormFieldName">Group</div>
      <GroupSelector v-if="feed" :currentGroup="feed.parentGroup" @change="changeGroup"/>

      <div class="FormFieldName">Custom Options</div>
      <OptionsInput class="" :options="feed.options" />
    </div>
  </details>

</template>

<style scoped>
.FeedHeader {
  /* display: flex; */
}

.FeedTypeBox {
  gap: 8px;
}

.InfoButton {
  font-weight: normal;
  color: var(--mute-text);
}

.QuickHelpText {
  max-width: 400px;
  line-height: 1.2;
  margin-top: 4px;
  font-size: var(--small-size);
}

.WideInput {
  width: 30ch;
  max-width: 100%;
}

.Settings {
  margin-top: var(--space-m);
  margin-bottom: 4px;
}

.SettingsBody {
  margin-top: var(--space-xs);
}

</style>
