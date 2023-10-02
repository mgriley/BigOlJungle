<script setup>
import { computed } from 'vue'
import { gApp } from './State.js'

function addSite() {
  console.log("Adding site");
  gApp.createSite();
}

</script>

<template>
  <div class="SiteList">
    <h1 class="PageHeader">Site List</h1>
    <div class="MarginBotS">
      <button @click="addSite">Add Site</button>
    </div>
    <div v-for="site in gApp.sites" :key="site.id" class="SiteItem Flex" @click="gApp.selectSite(site)">
      <p class="SiteName">{{ site.name ? site.name : "NoName" }}</p>
    </div>
  </div>
</template>

<style scoped>
.SiteList {
  margin: 0 auto;
  margin-top: var(--space-xl);
  background-color: var(--input-bg);
  padding: 16px;
  border: var(--border-reg);
  /* border-radius: var(--border-radius-l); */
  max-width: 800px;
}

.SiteItem {
  padding: 8px;
  border: var(--border-reg);
  border-radius: var(--border-radius-m);
  margin-bottom: var(--space-xs);

  cursor: pointer;
}

.SiteItem:hover {
  background-color: var(--light-color);
}

.SiteItem p {
  color: var(--main-text);
}

</style>
