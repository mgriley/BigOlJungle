<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import BasicModal from 'Shared/BasicModal.vue'
import DevView from './DevView.vue'
import ModalSelector from './ModalSelector.vue'
import DropdownSelector from './DropdownSelector.vue'
import { getTimeAgoStr } from 'Shared/SharedUtils.js'

const isMobile = ref(false)

function checkIfMobile() {
  // Consider mobile if screen width is less than 768px
  /*
  isMobile.value = window.innerWidth < 768
  */
 return false;
}

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
  console.log("Creating site and closing modal");
  createSiteModal.value.closeModal();
  let newSite = await gApp.createSite(siteToAdd.value.name);
  await gApp.openSiteWithId(newSite.id);
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

function getSiteDropdownOptions() {
  return [
    {
      name: 'Duplicate',
      icon: 'bi bi-copy',
      action: 'duplicate'
    },
    {
      name: 'Export',
      icon: 'bi bi-download',
      action: 'export'
    },
    {
      name: 'Delete',
      icon: 'bi bi-trash',
      action: 'delete'
    }
  ];
}

function onSiteDropdownChoice(site, option) {
  if (option.action === 'duplicate') {
    gApp.duplicateSite(site.id);
  } else if (option.action === 'export') {
    gApp.exportSite(site.id);
  } else if (option.action === 'delete') {
    gApp.deleteSite(site);
  }
}

function getLastModifiedText(site) {
  if (!site.lastModifiedTime) {
    return "Last modified: unknown";
  }
  
  const timeAgo = getTimeAgoStr(site.lastModifiedTime);
  
  // Handle the special case for "0 hrs ago"
  if (timeAgo === "0 hrs ago") {
    return "Last modified: just now";
  }
  
  return `Last modified: ${timeAgo}`;
}

onMounted(() => {
  gApp.reloadSites();
  checkIfMobile()
});

</script>

<template>
  <div v-if="isMobile" class="MobileMessage">
    <div class="MobileMessageContent">
      <h2>Small Device Detected 👀</h2>
      <p>This screen is too small to display our glorious website editor, sorry!</p>
      <p>Please come back on desktop to create a site.</p>
    </div>
  </div>

  <div v-else class="Toplevel">
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
      <div v-for="site in gApp.sites" :key="site.id" class="SiteItem Flex">
        <div class="SiteContent" @click="gApp.openSiteWithId(site.id)">
          <i class="bi bi-globe mr-s"></i>
          <div class="SiteInfo">
            <p class="SiteName">{{ site.name ? site.name : "Untitled" }}</p>
            <p class="SiteModified">{{ getLastModifiedText(site) }}</p>
          </div>
        </div>
        <div class="SiteActions" @click.stop>
          <DropdownSelector
            :items="getSiteDropdownOptions()"
            :currentItem="null"
            placeholder="⋯"
            :showIcon="false"
            minWidth="120px"
            @select="(option) => onSiteDropdownChoice(site, option)"
          />
        </div>
      </div>
      <BasicModal class="CreateSiteModal" ref="createSiteModal" title="Create Site"
        doneText="Create" @onCancel="onCancelAddSite" @onDone="onDoneAddSite">
        <div v-if="siteToAdd">
          <div class="FormFieldName">Name</div>
          <div>
            <input class="BasicTextInput" v-model="siteToAdd.name" type="text" autofocus @keydown.enter.prevent="onDoneAddSite">
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
        <a href="https://github.com/mgriley/BigOlJungle" target="_blank" class="FooterLink">
          <i class="bi bi-github"></i>
        </a>
        <a href="https://mastodon.social/@mriley" target="_blank" class="FooterLink">
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
  padding: var(--space-xs) var(--space-s);
  border: var(--border-reg);
  border-radius: var(--border-radius-m);
  margin-bottom: var(--space-xs);
  align-items: center;
  justify-content: space-between;
}

.SiteContent {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.SiteInfo {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.SiteModified {
  font-size: var(--f-xs);
  color: var(--light-color);
  margin: 0;
  margin-top: -4px;
}

.SiteActions {
  flex-shrink: 0;
  margin-left: var(--space-s);
}

.SiteItem:hover {
  background-color: #5383dc;
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

.SiteItem .bi-globe {
  color: #ff6b35;
}

.SiteActions :deep(.DropdownButton) {
  background: transparent;
  border: none;
  padding: var(--space-xs);
  color: var(--light-color);
  font-size: var(--f-l);
}

.SiteActions :deep(.DropdownButton:hover) {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: var(--main-text);
}

.MobileMessage {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: blue;
}

.HeroImage {
  width: 100%;
  height: 40vh;
  overflow: hidden;
}

.HeroImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.MobileMessageContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-l);
}

.MobileMessageContent h2 {
  color: var(--text-color);
  margin-bottom: var(--space-l);
  font-size: var(--f-xl);
}

.MobileMessageContent p {
  color: var(--text-color-secondary);
  margin-bottom: var(--space-m);
  font-size: var(--f-l);
  line-height: 1.5;
}

</style>
