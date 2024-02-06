<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { gApp, } from './State.js'
import Page from './Page.vue'
import { useRoute } from "vue-router"

const route = useRoute();

async function fetchData(pageId) {
  /*
  console.log("Setting curProj: " + newId);
  await gApp.dataLoadedPromise;
  let proj = await gApp.getProjectWithId(newId);
  console.log("Found proj: " + proj.id);
  gApp.curProj.value = proj;
  */
  // TODO Fetch the data from the peer or cache
  // TODO - left off here
  console.log("Fetching page id: " + pageId);
}

watch(() => {
    return route.params.id;
  },
  (newId) => {
    fetchData(newId);
  }, {immediate: true});

</script>

<template>
  <div>
    <Page :page="gApp.userPage" />
  </div>
</template>

<style scoped>
</style>
