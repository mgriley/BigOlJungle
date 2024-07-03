<script setup>
import { ref, onMounted, computed, watch, nextTick, } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import CollapsingHeader from './CollapsingHeader.vue'
import OptionsInput from './OptionsInput.vue'
import GroupSelector from './GroupSelector.vue'
import BasicSelector from './BasicSelector.vue'
import InfoTooltip from './InfoTooltip.vue'

const props = defineProps({
});

const emit = defineEmits(['onDone'])

let stepNum = ref(1);
let chosenFeedType = ref(null);
let feedUrl = ref("");
let feedUrlInput = ref(null);
let extraArgs = {};

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

function finishFeed() {
  let urlPrefix = chosenFeedType.value.addFeedHelp.urlCompleter || "";
  let url = urlPrefix + feedUrl.value;
  let optArgs = {
    type: chosenFeedType.value.name,
    url: url,
    name: chosenFeedType.value.getAutoNameFromUrl(url),
    ...extraArgs,
  };
  let feed = gApp.feedReader.addFeed(optArgs);
  // gApp.toast({message: 'Added feed', type: 'success'})
  emit('onDone');

  if (feed.type !== 'Bookmark') {
    gApp.router.push({name: 'feed', params: {id: feed.id}})
  }
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
  nextTick(() => {
    feedUrlInput.value.focus();
  });
  console.log("FeedType: ", chosenFeedType.value)
}

function reset(optArgs) {
  stepNum.value = 1;
  chosenFeedType.value = null;
  feedUrl.value = "";
  extraArgs = optArgs || {};
}

defineExpose({
  reset
})

</script>

<template>
  <div>
    <div class="MainArea MarginBotM">
      <div v-if="stepNum == 1">
        <p class="SmallText MarginBotS">What type of feed do you want to add?</p>
        <div class="">
          <div class="FeedTypeDiv MarginBotXS">
            <div v-for="type of supportedFeedTypes" class="FeedTypeItem">
              <p class="MockButton" @click="chooseFeed(type.type)"><i :class="['bi-' + type.icon, 'FeedTypeIcon']"></i>{{type.name}}</p>
            </div>
            <div v-for="type of customFeedTypes" class="FeedTypeItem">
              <p class="MockButton" @click="chooseFeed(type.type)"><i :class="['bi-' + type.icon, 'FeedTypeIcon']"></i>{{type.name}}</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="stepNum == 2">
        <!-- <p class="SmallText MarginBotS">{{chosenFeedType.name}}</p> -->
        <p class="MarginTopS MarginBotXXS SmallText">{{chosenFeedType.addFeedHelp.urlHelp}}:</p>
        <div v-if="chosenFeedType.addFeedHelp.urlCompleter" class="FormFieldName SmallerText">{{chosenFeedType.addFeedHelp.urlCompleter}}{{feedUrl}}</div>
        <input ref="feedUrlInput" v-model="feedUrl" class="Block BasicTextInput MarginBotM" autofocus placeholder="">
        <p class="SmallerText MuteText">Ex. {{chosenFeedType.addFeedHelp.urlExample}}</p>
      </div>
    </div>
    <div class="Flex ButtonRow">
      <button v-if="stepNum > 1" class="SmallButton Flex AlignCenter BackBtn" @click="stepNum -= 1"><vue-feather class="Icon" type="arrow-left"/>Back</button>
      <button v-if="stepNum > 1" class="SmallButton Flex AlignCenter" @click="advanceStep">{{stepNum < 2 ? 'Next' : 'Done'}}<vue-feather class="Icon" type="arrow-right"/></button>
    </div>
  </div>
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
  /* gap: var(--space-xs); */
  gap: 1px;
}

.FeedTypeItem {
  padding: var(--space-xs);
  outline: 1px solid DeepPink;
}

.FeedTypeItem p {
  font-size: var(--small-size);
  text-align: center;
}

.FeedTypeIcon {
  margin-right: var(--space-xs);
  color: yellow;
}

.ButtonRow {
  justify-content: center;
}

.BackBtn {
  margin-right: auto;
}

</style>
