<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import BasicModal from 'Shared/BasicModal.vue'
import CollapsingHeader from './CollapsingHeader.vue'
import OptionsInput from './OptionsInput.vue'
import GroupSelector from './GroupSelector.vue'
import BasicSelector from './BasicSelector.vue'
import draggable from 'vuedraggable'

const props = defineProps({
  feed: Object
});

function changeGroup(newGroup) {
  props.feed.moveToGroup(newGroup);  
}

let showOptions = ref(false);

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

</script>

<template>
  <div class="FeedHeader">
    <div class="FormFieldName">Name</div>
    <input v-model="feed.name" placeholder="Feed name" class="Block WideInput BasicTextInput">
    <div class="FormFieldName">Group</div>
    <GroupSelector :currentGroup="feed.parentGroup" @change="changeGroup"/>
  </div>
  <div class="FormFieldName">Feed Type</div>
  <BasicSelector :value="feed.type" :options="supportedFeedTypes" @change="(newVal) => onChangeFeedType(feed, newVal)"/>
  <!-- <p>{{ feed.type }}</p> -->
  <div class="FormFieldName">Feed URL</div>
  <input v-model="feed.url" placeholder="Ex: https://www.someurl.com/feed.rss"
    class="Block WideInput BasicTextInput">

  <div class="FormFieldName">Custom Options</div>
  <OptionsInput :options="feed.options" />
</template>

<style scoped>
.FeedHeader {
  /* display: flex; */
}

.WideInput {
  min-width: 400px;
}
</style>
