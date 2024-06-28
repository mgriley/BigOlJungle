<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr, kReaderVersionString } from '../State.js'
import BasicModal from 'Shared/BasicModal.vue'
import BasicSelector from './BasicSelector.vue'

/*
See:
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_sidenav_fixed2
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_topnav
https://codepen.io/flaviocopes/pen/JZWOEK
*/

let importConfigModal = ref(null);
let importFileInput = ref(null);
let importType = ref('config');

let exportConfigModal = ref(null);
let exportType = ref('config');

function startImportConfig() {
  importConfigModal.value.showModal();
}

function startExportConfig() {
  exportConfigModal.value.showModal();
}

function importConfig() {
  console.log("Starting import");
  const uploadedFile = importFileInput.value.files[0];
  if (!uploadedFile) {
    console.log("No file uploaded");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", (evt) => {
    if (!reader.result || reader.result === "") {
      console.log("The read file is invalid");
      return;
    }
    gApp.importFile(reader.result, importType.value);  
  }, false);

  console.log("Reading file: " + uploadedFile.name);
  reader.readAsText(uploadedFile);
}

function goToHome() {
  gApp.router.replace({path: "/"})  
}

let menuOpen = ref(false);

function toggleMobileMenu() {
  menuOpen.value = !menuOpen.value;
}

onMounted(() => {
  // Close the menu when we change routes 
  watch(gApp.router.currentRoute, (newVal, oldVal) => {
    menuOpen.value = false;
  });
});

</script>

<template>
  <div class="ContainerLayer">
    <div class="FixedBgImg"></div>
    <div class="BodyOverlay">
      <div class="toplevel">
        <div class="Sidebar">
          <div class="InnerSidebar">
            <div class="SidebarBtnBar Flex AlignBaseline">
              <p class="SidebarBtn" @click="goToHome">
                JungleReader
                <!-- <vue-feather class="MenuIcon" id="SidebarMenuIcon" :type="menuOpen ? 'x' : 'menu'" size="24" stroke-width="3" stroke-linecap="butt"></vue-feather> -->
              </p>
              <button class="SidebarMenuBtn" @click="toggleMobileMenu">
                <vue-feather class="MenuIcon" id="SidebarMenuIcon" :type="menuOpen ? 'x' : 'menu'" size="20" stroke-width="2" stroke-linecap="butt"></vue-feather>
              </button>
            </div>
            <div class="SidebarContent" :class="{'open': menuOpen}" id="SidebarContent">
              <div class="HeroDiv Flex">
                <!-- <div class="HeroIcon"> -->
                  <!-- <vue-feather class="InnerIcon" size="64" type="rss" /> -->
                <!-- </div> -->
                <div class="AppTitleDiv">
                  <p class="AppTitle" @click="goToHome">Jungle<br><span class="LastLine">Reader</span></p>
                  <!-- <img class="HeroImg" src="../assets/NounCham.svg" /> -->
                  <p class="AppSubTitle">Read the jungle</p>
                </div>
              </div>
              <div class="SideMenu">
                <div class="Section">
                  <router-link to="/" id="HomeLink" class="MainLink MenuLink"><vue-feather type="home" class="Icon"/>Home</router-link>
                  <router-link to="/explore" class="MainLink MenuLink"><vue-feather type="compass" class="Icon"/>Explore</router-link>
                </div>
                <div class="Section">
                  <router-link to="/plugins" class="MainLink MenuLink"><vue-feather type="plus-square" class="Icon"/>Plugins</router-link>
                  <router-link to="/settings" class="MainLink MenuLink"><vue-feather type="settings" class="Icon"/>Settings</router-link>
                </div>
                <div class="Section">
                  <a href="#" @click.prevent="startExportConfig()" class="MainLink MenuLink"><vue-feather type="upload" class="Icon"/>Export Data</a>
                  <a href="#" @click.prevent="startImportConfig()" class="MainLink MenuLink"><vue-feather type="download" class="Icon"/>Import Data</a>
                </div>
                <div class="Section">
                  <router-link to="/about" class="MainLink MenuLink"><vue-feather type="info" class="Icon" />About</router-link>
                  <router-link to="/addsupport" class="MainLink MenuLink"><vue-feather type="plus" class="Icon" />Add Support</router-link>
                  <router-link to="/privacypolicy" class="MainLink MenuLink"><vue-feather type="shield" class="Icon" />Privacy Policy</router-link>
                  <a href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank" class="MainLink MenuLink"><vue-feather type="send" class="Icon" />Report Bug <!--<vue-feather type="external-link" size="16" />!--></a>
                  <a href="https://github.com/mgriley/BigOlJungle" target="_blank" class="MainLink MenuLink"><vue-feather type="github" class="Icon" />GitHub <!--<vue-feather type="external-link" size="16" />!--></a>
                </div>
                <div class="Section VersionSection">
                  <p class="VersionNum">Version {{ kReaderVersionString }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="main">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
  <BasicModal ref="importConfigModal" title="Import Data" doneText="Import" @onDone="importConfig" class="ImportModal">
    <div class="MarginBotM">
      <p>What would you like to import?</p>
      <div class="Flex ImportOptions">
        <button class="SmallButton ImportButton" :class="{IsSelected: importType == 'config'}" @click="importType = 'config'">JungleReader Config</button>
        <button class="SmallButton ImportButton" :class="{IsSelected: importType == 'opml'}" @click="importType = 'opml'">OPML File</button>
      </div>
    </div>
    <p>Details:</p>
    <div v-if="importType == 'config'">
      <p>When you import a JungleReader config, it will fully overwrite your current config (feeds, settings, etc.).</p>
      <p>You may want to export your current config first.</p>
    </div>
    <div v-else-if="importType == 'opml'">
      <p>Importing an OPML file will add all the OPML feeds to your feeds page.</p>
    </div>
    <div class="ImportBox">
      <input ref="importFileInput" type="file" id="input" />
    </div>
  </BasicModal>
  <BasicModal class="ExportModal" ref="exportConfigModal" title="Export Data" doneText="Export" @onDone="gApp.exportData(exportType)">
    <div class="MarginBotM">
      <p>What would you like to export?</p>
      <div class="Flex ImportOptions">
        <button class="SmallButton ImportButton" :class="{IsSelected: exportType == 'config'}" @click="exportType = 'config'">JungleReader Config</button>
        <button class="SmallButton ImportButton" :class="{IsSelected: exportType == 'opml'}" @click="exportType = 'opml'">OPML File</button>
      </div>
    </div>
    <p>Details:</p>
    <div v-if="exportType == 'config'">
      <p>
      This will download your current config, which includes your feeds, groups,
      plugins, settings, and other data.
      </p>
    </div>
    <div v-else-if="exportType == 'opml'">
      <p>This will download all your feeds in OPML format.</p>
    </div>
  </BasicModal>
</template>

<style scoped>
.HeroDiv {
  margin-bottom: var(--space-l);
  /* display: flex; */

  /* background-color: var(--brand-color-yellow); */
  /* padding-left: 8px; */

  /* margin-left: 46px; */

  gap: 12px;
}

.HeroIcon {
  background-color: var(--brand-color-yellow);
  width: 60px;
  /* width: 24px; */
  height: auto;
}

.HeroIcon .InnerIcon {
  color: black;
}

.AppTitle {
  color: var(--header-text);

  /* padding-bottom: 2px; */
  /* border-bottom: 4px solid var(--brand-color); */

  font-family: var(--title-font);
  /* font-size: var(--p-size); */
  font-size: 36px;
  /* font-size: var(--h3-size); */
  line-height: 1.0;
  /* text-transform: uppercase; */
  font-weight: bold;

  cursor: pointer;
}

.AppSubTitle {
  /* display: none; */

  color: var(--brand-color-purple);
  /* color: fuchsia; */

  font-size: var(--smaller-size);
  /* font-style: italic; */
}

.AppTitle .LastLine {
}

.AppTitle .Dot {
  color: red;
}

/*
Note: this somewhat odd page structure is because chrome was having flicker issues
  with background images with background-attachment fixed.
*/
.FixedBgImg {
  position: fixed;
  z-index: -1;

  //background-color: orange;
  //background-color: #696969;

  //background-color: #e900c6;
  //background-image: linear-gradient(160deg, #e900c6 0%, #edff00 100%);

  //background-image: url(../assets/CityBgModded.jpg);
  //background-image: url(../assets/daniel-o-dowd-jungle-unsplash-modded.jpg);
  background-image: url(../assets/yoal-desurmont-jungle-unsplash.jpg);

  background-size: cover;
  /* background-attachment: fixed; */
  /* background-repeat: no-repeat; */
  /* background-position: top; */
  background-position: 50% 25%;
  width: 100%;
  min-height: 100vh;
}

.BodyOverlay {
  /*backdrop-filter: grayscale(50%);*/
  /*backdrop-filter: hue-rotate(60deg) brightness(100%);*/
  /* backdrop-filter: brightness(400%); */
  min-height: 100vh;
}

.toplevel {
  max-width: 1280px;
  margin: auto;
  display: grid;
  padding: var(--space-m) var(--space-xs);
  /* grid-template-columns: 1fr 3fr; */
  grid-template-columns: auto 3fr;
  grid-template-areas: 
    "sidebar content"
}

.main {
  margin-left: 16px;
  background-color: var(--main-bg);
  border: var(--pane-border);
  border-radius: var(--pane-border-radius);
  /* max-width: 100%; */
  /* Aim for 40-80ch max-width */
  max-width: 760px;
  /* max-width: 800px; */
  grid-area: content;
  /*padding: var(--space-m);*/
  padding: var(--space-s) var(--space-m);
  overflow-x: visible;

  /* border-left: 1px solid var(--secondary-text); */
  /* border-right: 1px solid var(--secondary-text); */
}

.Sidebar {
  grid-area: sidebar;
  /* margin-left: var(--space-m); */
}

.InnerSidebar {
  background-color: var(--main-bg);
  /* padding: var(--space-m) var(--space-m) var(--space-xs) var(--space-m); */
  padding: var(--space-s) var(--space-l) var(--space-s) var(--space-m);
  border: var(--pane-border);
  border-radius: var(--pane-border-radius);
  /* min-height: 800px; */
}

.SidebarContent {
  padding-bottom: var(--space-xs);
}

.SideMenu a {
  /* margin-bottom: var(--space-xs); */
  /* color: var(--secondary-text); */
}

.MainLink {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: 8px;

  font-weight: var(--bold-weight);
  font-size: var(--p-size);
  text-decoration: none;
  -webkit-text-decoration: none;
  padding: var(--space-xxs);

  border-radius: 0px;
}

.SideMenu .Section:not(:last-child) {
  margin-bottom: var(--space-s);
}

.SidebarBtnBar {
  display: none;
}

.SidebarBtn {
  color: var(--header-text);
  font-family: var(--title-font);
  font-size: 28px;
  font-weight: bold;
  letter-spacing: -2px;

  cursor: pointer;
}

.SidebarMenuBtn {
  min-width: 0;
  padding: var(--space-xs);
  margin-left: auto;
  display: flex;
  align-items: center;
}

.SidebarBtn .MenuIcon {
  margin-left: 8px;
  padding-left: 8px;
}

/*
Display a single column on mobile.
Also collapse the menu.
*/
@media (max-width: 768px) {
  .toplevel {
    max-width: 100%;
    padding: var(--space-s) var(--space-s);
    grid-template-columns: 100%;
    grid-template-areas:
      "sidebar"
      "content";
    /* Hide x-overflow on mobile so that we don't get janky horizontal scrolling/jerking */
    /* When commented out, can try dragging left/right on mobile and see the difference */
    overflow-x: hidden;
  }

  .main {
    margin-left: 0;
    padding: var(--space-xs);
    border: none;
  }

  .FixedBgImg {
    background-image: none;
  }

  .Sidebar {
    /*border-bottom: 1px solid var(--mute-text);*/
    margin-left: 0;
    /* margin-bottom: var(--space-xs); */
    padding: 0;
  }

  .InnerSidebar {
    /* padding: 0 var(--space-xs); */
    padding: var(--space-xs);
    border: none;
  }

  .SidebarBtnBar {
    display: flex;
  }

  .HeroDiv {
    display: none;
  }

  .SidebarContent {
    display: none;
    padding-top: var(--space-s);
    background-color: var(--popup-bg);
    border: 1px solid var(--brand-color-yellow);
    border-radius: var(--border-radius-med);
  }

  .SidebarContent a {
  }

  .MainLink {
    padding: 8px;
    padding-left: var(--space-m);
  }

  .SidebarContent p {
    padding-left: var(--space-m);
  }

  .SidebarContent.open {
    display: block;
  }
}

.VersionSection {
  margin-top: var(--space-m);
}

.VersionNum {
  color: var(--mute-text);
  /* font-style: italic; */
  font-size: var(--small-size);
}

#HomeLink {
}

.router-link-active {
  color: var(--main-bg);
  background-color: var(--main-text);
  /*
  border-bottom: 1px solid red;
  */
}

.router-link-active .Icon {
  color: var(--button-icon-inverse);
}

.ImportBox {
  margin-top: var(--space-s);
}

.ImportBox input {
  font-size: var(--p-size);
  margin-bottom: var(--space-xs);
}

.ExportModal {
  width: 600px;
}

.ImportModal {
  width: 700px;
}

.ImportOptions {
  gap: var(--space-m);
}

.ImportButton.IsSelected {
  border-bottom: 2px solid var(--brand-color-yellow);
  border-radius: 0;
}

</style>
