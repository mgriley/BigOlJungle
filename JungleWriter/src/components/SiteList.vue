<script setup>
import { ref, computed } from 'vue'
import { gApp } from './State.js'
import BasicModal from 'Shared/BasicModal.vue'
import DevView from './DevView.vue'

let createSiteModal = ref(null);
let siteToAdd = ref(null);
let devModal = ref(null);
let fileInput = ref(null);

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
  await gApp.createSite(siteToAdd.value.name);
  siteToAdd.value = null;
}

function showDevView() {
  devModal.value.showModal();
}

function onCloseDevView() {
  // Modal handles closing itself
}

function importSite() {
  fileInput.value.click();
}

async function onFileSelected(event) {
  const file = event.target.files[0];
  if (file && file.type === 'application/zip') {
    try {
      await gApp.importSite(file);
      console.log('Site imported successfully');
    } catch (error) {
      console.error('Failed to import site:', error);
      alert('Failed to import site. Please check the console for details.');
    }
  } else {
    alert('Please select a valid ZIP file.');
  }
  // Reset the file input
  event.target.value = '';
}

</script>

<template>
  <div class="Toplevel">
    <div class="SiteList">
      <h1 class="Title mb-s">JungleWriter 🌴🐒</h1>
      <p class="Subtitle mb-l">Build a website for your next project now. No coding experience required. Free and open-source.</p>
      <div class="MarginBotS">
        <button @click="addSite" class="mr-xxs">New Site</button>
        <button @click="importSite" class="mr-xs">Import</button>
        <button @click="showDevView" class="TertiaryButton">Developer Tools</button>
      </div>
      <div v-for="site in gApp.sites" :key="site.id" class="SiteItem Flex" @click="gApp.openSiteWithId(site.id)">
        <p class="SiteName">{{ site.name ? site.name : "Untitled" }}</p>
        <p class="SiteId">Id: {{ site.id }}</p>
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
      <BasicModal class="DevModal" ref="devModal" title="Developer Tools"
        :showDone="false" cancelText="Close" @onCancel="onCloseDevView">
        <DevView />
      </BasicModal>
      <input 
        ref="fileInput" 
        type="file" 
        accept=".zip" 
        @change="onFileSelected" 
        style="display: none;"
      />
    </div>
  </div>
</template>

<style scoped>
.Toplevel {
  height: 100vh;
  padding: var(--space-xl);
  background-color: rgb(28, 28, 230);
}

.SiteList {
  margin: 0 auto;
  background-color: rgb(28, 28, 230);
  padding: 16px;
  border: var(--border-reg);
  /* border-radius: var(--border-radius-l); */
  max-width: 800px;
  height: 100%;
  overflow: auto;
}

.Title {
  text-align: center;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.Subtitle {
  text-align: center;
  width: 100%;
  max-width: 50ch;
  margin-left: auto;
  margin-right: auto;
  font-size: var(--f-l);
  color: white;
  font-weight: 400;
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


</style>
