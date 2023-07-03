<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import BasicModal from 'Shared/BasicModal.vue'
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

let supportedFeedTypes = computed(() => {
  let types = []
  for (const plugin of gApp.feedPlugins) {
    types.push(plugin.name);
  }
  return types;
})

</script>

<template>
  <div class="FeedHeader">
    <GroupSelector :currentGroup="feed.parentGroup" @change="changeGroup"/>
    <input v-model="feed.name" placeholder="Feed name" class="Block WideInput">
  </div>
  <BasicSelector :value="feed.type" :options="supportedFeedTypes" />
  <input v-model="feed.url" placeholder="Ex: https://www.someurl.com/feed.rss"
    class="Block WideInput">

  <p>Options:</p>
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
