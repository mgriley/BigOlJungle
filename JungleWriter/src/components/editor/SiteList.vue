<script setup>
import { ref, computed } from 'vue'
import { gApp } from './State.js'
import BasicModal from 'Shared/BasicModal.vue'

let createSiteModal = ref(null);
let siteToAdd = ref(null);

class SiteData {
  constructor() {
    this.name = "";
  }
};

function addSite() {
  siteToAdd.value = new SiteData();
  createSiteModal.value.showModal();
}

function onCancelAddSite() {
  siteToAdd.value = null;
}

async function onDoneAddSite() {
  console.log("Adding site");
  let site = await gApp.createSite();
  gApp.changeSiteName(site.id, siteToAdd.value.name);
  siteToAdd.value = null;
}

</script>

<template>
  <div class="Container">
    <div class="SiteList">
      <h1 class="PageHeader">Site List</h1>
      <div class="MarginBotS">
        <button @click="addSite">Add Site</button>
      </div>
      <div v-for="site in gApp.sites" :key="site.id" class="SiteItem Flex" @click="gApp.selectSiteById(site.id)">
        <p class="SiteName">{{ site.name ? site.name : "NoName" }}</p>
        <p class="SiteId">Id: {{ site.id }}</p>
      </div>
      <div class="DevControls">
        <div>Dev Controls</div>
        <button @click="gApp.userStorage.dumpAll()" class="TertiaryButton">Dump storage</button>
        <button @click="gApp.userStorage.clearAll()" class="TertiaryButton">Clear storage</button>
      </div>
    </div>
    <BasicModal class="CreateSiteModal" ref="createSiteModal" title="Create Site"
      doneText="Create" @onCancel="onCancelAddSite" @onDone="onDoneAddSite">
      <div v-if="siteToAdd">
        <div class="FormFieldName">Name</div>
        <div>
          <input class="BasicTextInput" v-model="siteToAdd.name" type="text" autofocus>
        </div>
      </div>
    </BasicModal>
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

.SiteId {
  margin-left: var(--space-m);
}

.DevControls {
  margin-top: var(--space-xl);
  border-top: 1px solid var(--secondary-text);
  padding-top: var(--space-xs);
}

.DevControls button {
  display: block;
}

</style>
