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

const emit = defineEmits(['onDone'])

let stepNum = ref(1);
let chosenFeedType = ref(null);
let feedUrl = ref("");

function changeGroup(newGroup) {
  props.feed.moveToGroup(newGroup);  
}

let supportedFeedTypes = computed(() => {
  let types = []
  for (const plugin of gApp.feedPlugins) {
    types.push({name: plugin.name, icon: plugin.uiIcon || 'box', type: plugin});
  }
  return types;
})

let customFeedTypes = computed(() => {
  let types = []
  for (const plugin of gApp.customPlugins) {
    if (plugin.feedType) {
      types.push({name: plugin.feedType, icon: 'plugin', type: plugin});
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

function finishFeed() {
  let feed = props.feed;
  feed.type = chosenFeedType.value.name;
  let urlPrefix = chosenFeedType.value.addFeedHelp.urlCompleter || "";
  feed.url = urlPrefix + feedUrl.value;
  feed.name = chosenFeedType.value.getAutoNameFromUrl(feed.url);
  gApp.toast({message: 'Added feed', type: 'success'})
  emit('onDone');
}

function advanceStep() {
  if (stepNum.value < 2) {
    stepNum.value += 1;
  } else {
    finishFeed();
  }
}

function chooseFeed(feedType) {
  if (feedType !== chosenFeedType.value) {
    feedUrl.value = "";
  }
  chosenFeedType.value = feedType;
  stepNum.value += 1;
  console.log("FeedType: ", chosenFeedType.value)
}

</script>

<template>
  <div>
    <div class="MainArea MarginBotM">
      <div v-if="stepNum == 1">
        <p class="SmallText MarginBotS">What type of feed do you want to add?</p>
        <div class="">
          <div class="FeedTypeDiv MarginBotXS">
            <div v-for="type of supportedFeedTypes">
              <p class="MockButton" @click="chooseFeed(type.type)"><i :class="['bi-' + type.icon, 'FeedTypeIcon']"></i>{{type.name}}</p>
            </div>
          </div>
          <div class="FeedTypeDiv">
            <div v-for="type of customFeedTypes">
              <p class="MockButton" @click="chooseFeed(type.type)"><i :class="['bi-' + type.icon, 'FeedTypeIcon']"></i>{{type.name}}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="stepNum == 2">
        <!-- <p class="SmallText MarginBotS">{{chosenFeedType.name}}</p> -->
        <p class="MarginTopS MarginBotXXS">{{chosenFeedType.addFeedHelp.urlHelp}}:</p>
        <div v-if="chosenFeedType.addFeedHelp.urlCompleter" class="FormFieldName SmallerText">{{chosenFeedType.addFeedHelp.urlCompleter}}{{feedUrl}}</div>
        <input v-model="feedUrl" class="Block BasicTextInput MarginBotM" autofocus placeholder="">
        <p class="SmallerText">Ex. {{chosenFeedType.addFeedHelp.urlExample}}</p>
      </div>
    </div>
    <div class="Flex ButtonRow">
      <button v-if="stepNum > 1" class="SmallButton Flex AlignCenter BackBtn" @click="stepNum -= 1"><vue-feather class="Icon" type="arrow-left"/>Back</button>
      <button v-if="stepNum > 1" class="SmallButton Flex AlignCenter" @click="advanceStep">{{stepNum < 2 ? 'Next' : 'Done'}}<vue-feather class="Icon" type="arrow-right"/></button>
    </div>
  </div>
  
  <!--
  <div class="FeedHeader">
    <div class="FormFieldName">Name</div>
    <input v-model="feed.name" class="Block BasicTextInput" autofocus placeholder="Enter name">
  </div>
  <div class="FormFieldName">Type</div>
  <div class="Flex FeedTypeBox">
    <BasicSelector :value="feed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(feed, newVal)"/>
  </div>
  <div class="FormFieldName">URL</div>
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
  -->

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

.FeedTypeDiv {
  display: grid;
  grid-template-columns: auto auto;
  gap: var(--space-xs);
}

.FeedTypeIcon {
  margin-right: var(--space-xs);
}

.ButtonRow {
  justify-content: center;
}

.BackBtn {
  margin-right: auto;
}

</style>
