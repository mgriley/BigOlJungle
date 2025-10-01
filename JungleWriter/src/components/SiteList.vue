<script setup>
import { ref, computed } from 'vue'
import { gApp } from './State.js'
import BasicModal from 'Shared/BasicModal.vue'
import DevView from './DevView.vue'
import ModalSelector from './ModalSelector.vue'

let createSiteModal = ref(null);
let siteToAdd = ref(null);
let devModal = ref(null);
let fileInput = ref(null);
let menuSelector = ref(null);

const isLocalhost = computed(() => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
});

const menuOptions = computed(() => {
  const options = [
    {
      name: 'Import Site',
      icon: 'bi bi-download',
      action: 'import'
    }
  ];
  
  if (isLocalhost.value) {
    options.push({
      name: 'DevTools',
      icon: 'bi bi-gear',
      action: 'devtools'
    });
  }
  
  return options;
});

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

function showMenu(event) {
  menuSelector.value.showModal(event);
}

function onMenuChoice(option) {
  if (option.action === 'import') {
    importSite();
  } else if (option.action === 'devtools') {
    showDevView();
  }
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
      <div class="MenuContainer">
        <button @click="showMenu" class="MenuButton">
          <i class="bi bi-three-dots"></i>
        </button>
      </div>
      <div class="Header mb-l">
        <div class="HeaderContent">
          <h1 class="Title mb-s">JungleWriter 🌴🐒</h1>
          <p class="Subtitle">Build a website for your next project now. No coding experience required. Free and open-source.</p>
        </div>
      </div>
      
      <div class="ButtonContainer mb-l">
        <button @click="addSite">
          <i class="bi bi-plus-circle"></i>
          New Site
        </button>
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
      
      <ModalSelector 
        ref="menuSelector" 
        :options="menuOptions" 
        @choose="onMenuChoice"
      />
      
      <div class="Footer">
        <a href="https://github.com/junglewriter/junglewriter" target="_blank" class="FooterLink">
          <i class="bi bi-github"></i>
        </a>
        <a href="https://mastodon.social/@junglewriter" target="_blank" class="FooterLink">
          <i class="bi bi-mastodon"></i>
        </a>
      </div>
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

.Header {
}

.HeaderContent {
  flex: 1;
}

.MenuContainer {
  flex-shrink: 0;
  margin-left: var(--space-m);
}

.MenuButton {
  float: right;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: white;
  border-radius: var(--border-radius-m);
  cursor: pointer;
  padding: var(--space-xxs);
  min-width: 0px;
  width: 40px;
  height: 40px;
  transition: all 0.2s ease;
}

.MenuButton:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.ButtonContainer {
  text-align: center;
}

.ButtonContainer button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  /*background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);*/
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: var(--space-s) var(--space-l);
  border-radius: var(--border-radius-l);
  font-weight: 600;
  font-size: var(--f-l);
  cursor: pointer;
  transition: all 0.3s ease;
  /*box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);*/
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.ButtonContainer button:hover {
  transform: translateY(-2px);
  /*box-shadow: 0 8px 25px rgba(255, 107, 53, 0.6);*/
}

.ButtonContainer button:active {
  transform: translateY(0);
  /*box-shadow: 0 4px 15px rgba(255, 107, 53, 0.4);*/
}

.Footer {
  position: absolute;
  bottom: var(--space-xs);
  left: 50%;
  transform: translateX(-50%);
}

.Footer {
  display: flex;
  gap: var(--space-xs);
}

.FooterLink {
  color: white;
  font-size: var(--f-l);
  text-decoration: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-m);
}

.FooterLink:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

</style>
