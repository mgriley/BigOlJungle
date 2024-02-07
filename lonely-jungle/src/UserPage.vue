<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { gApp, } from './State.js'
import Page from './Page.vue'
import { useRoute } from "vue-router"

const route = useRoute();

let isOnline = ref(false);
let pageData = ref(null);

async function fetchData(pageId) {
  console.log("Check if user online: " + pageId);
  isOnline.value = await gApp.checkIsOnline(pageId);
  if (!isOnline.value) {
    return;
  }
  console.log("Fetching page id: " + pageId);
  pageData.value = await gApp.loadUserPage(pageId);
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
    <div v-if="isOnline">
      <Page :page="pageData.value" />
    </div>
    <div v-else>
      <p>{{ route.params.id }} is not online. Come back later to see their page!</p>
    </div>
  </div>
</template>

<style scoped>
</style>
