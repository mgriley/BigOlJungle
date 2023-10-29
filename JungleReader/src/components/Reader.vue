<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr, kReaderVersionString } from '../State.js'
import BasicModal from 'Shared/BasicModal.vue'

/*
See:
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_sidenav_fixed2
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_topnav
https://codepen.io/flaviocopes/pen/JZWOEK
*/

let importConfigModal = ref(null);
let importFileInput = ref(null);

let exportConfigModal = ref(null);

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
    gApp.importConfig(reader.result);  
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
  <div class="toplevel">
    <div class="Sidebar">
      <div class="SidebarBtnBar Flex">
        <button class="SidebarBtn" @click="toggleMobileMenu">
          JungleReader
          <!-- <vue-feather class="MenuIcon" id="SidebarMenuIcon" :type="menuOpen ? 'x' : 'menu'" size="24" stroke-width="3" stroke-linecap="butt"></vue-feather> -->
        </button>
        <button class="SidebarMenuBtn" @click="toggleMobileMenu">
          <vue-feather class="MenuIcon" id="SidebarMenuIcon" :type="menuOpen ? 'x' : 'menu'" size="24" stroke-width="3" stroke-linecap="butt"></vue-feather>
        </button>
      </div>
      <div class="SidebarContent" :class="{'open': menuOpen}" id="SidebarContent">
        <div class="HeroDiv">
          <p class="AppTitle" @click="goToHome">Jungle<br><span class="LastLine">Reader</span></p>
          <img class="HeroImg" src="../assets/BigChameleon.png" />
        </div>
        <div class="SideMenu">
          <div class="Section">
            <router-link to="/" id="HomeLink" class="MainLink"><vue-feather type="home" class="Icon"/>Home</router-link>
            <router-link to="/explore" class="MainLink"><vue-feather type="compass" class="Icon"/>Explore</router-link>
          </div>
          <div class="Section">
            <router-link to="/plugins" class="MainLink"><vue-feather type="plus-square" class="Icon"/>Plugins</router-link>
            <router-link to="/settings" class="MainLink"><vue-feather type="settings" class="Icon"/>Settings</router-link>
          </div>
          <div class="Section">
            <a href="#" @click.prevent="startImportConfig()" class="MainLink"><vue-feather type="download" class="Icon"/>Import Config</a>
            <a href="#" @click.prevent="startExportConfig()" class="MainLink"><vue-feather type="download" class="Icon"/>Download Config</a>
          </div>
          <div class="Section">
            <router-link to="/about" class="MainLink"><vue-feather type="info" class="Icon" />About</router-link>
            <router-link to="/addsupport" class="MainLink"><vue-feather type="plus" class="Icon" />Add Support</router-link>
            <router-link to="/privacypolicy" class="MainLink"><vue-feather type="shield" class="Icon" />Privacy Policy</router-link>
            <a href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank" class="MainLink"><vue-feather type="send" class="Icon" />Report Bug <!--<vue-feather type="external-link" size="16" />!--></a>
            <a href="https://github.com/mgriley/BigOlJungle" target="_blank" class="MainLink"><vue-feather type="github" class="Icon" />GitHub <!--<vue-feather type="external-link" size="16" />!--></a>
          </div>
          <div class="Section">
            <p class="VersionNum">Version {{ kReaderVersionString }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
  <BasicModal ref="importConfigModal" title="Import Config" doneText="Import" @onDone="importConfig">
    <p>When you import a config, it will override your current config.</p>
    <p>You may want to export your current config first.</p>
    <div class="ImportBox">
      <input ref="importFileInput" type="file" id="input" />
    </div>
  </BasicModal>
  <BasicModal class="ExportModal" ref="exportConfigModal" title="Download Config" doneText="Download" @onDone="gApp.exportConfig()">
    <p>
    This will download your current config, which includes your feeds, groups,
    plugins, settings, and other data.
    </p>
  </BasicModal>
</template>

<style scoped>
.HeroDiv {
  position: relative;
  margin-bottom: var(--space-l);

  /*
  background-color: var(--nice-red);
  padding: 8px;
  border-radius: 8px;
  */
}

.HeroImg {
  width: 300px;
  height: auto;
  transform: rotate(-22deg);
  filter: invert(100%);
}

.AppTitle {
  /* position: absolute; */
  top: 0;
  left: 0;

  color: var(--header-text);
  /* color: var(--nice-red); */

  font-family: 'Gill Sans';
  font-size: 32px;
  /* font-size: 44px; */
  /* font-weight: 900; */
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -2px;
  padding-bottom: 2px;
  cursor: pointer;
}

.AppTitle .LastLine {
  /* text-decoration: var(--brand-underline); */
}

.toplevel {
  max-width: 1280px;
  margin: auto;
  display: grid;
  padding: var(--space-m) var(--space-xs);
  grid-template-columns: 1fr 3fr;
  /* gap: var(--space-s); */
  grid-template-areas: 
    "sidebar content"
}

.main {
  /* max-width: 100%; */
  /* Aim for 40-80ch max-width */
  max-width: 840px;
  grid-area: content;
  /*background-color: #20bf6b;*/
  padding: var(--space-m);
  overflow-x: visible;

  /* border-left: 1px solid var(--secondary-text); */
  /* border-right: 1px solid var(--secondary-text); */
}

.Sidebar {
  grid-area: sidebar;
  padding: var(--space-m) var(--space-m) 0px var(--space-m);
  /* margin-left: var(--space-m); */
  /*background-color: #45aaf2;*/
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
  padding: var(--space-xxs);

  border-radius: 4px;
}

.SideMenu .Section:not(:last-child) {
  margin-bottom: var(--space-l);
}

.MainLink .Icon {
  /* color: var(--brand-color); */
}

.SidebarBtnBar {
  display: none;
}

.SidebarBtn {
  border-radius: 0;
  font-size: var(--p-size);
  font-weight: 900;
  letter-spacing: -2px;
  background-color: var(--main-text);
  color: var(--main-bg);
}

.SidebarMenuBtn {
  min-width: 0;
  font-size: 1.5rem;
  font-weight: 900;
  border: none;
  border-radius: 0;
  background-color: var(--main-text);
  color: var(--main-bg);
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
    padding: 24px 24px;
    grid-template-columns: 100%;
    grid-template-areas:
      "sidebar"
      "content";
    /* Hide x-overflow on mobile so that we don't get janky horizontal scrolling/jerking */
    /* When commented out, can try dragging left/right on mobile and see the difference */
    overflow-x: hidden;
  }

  .main {
    padding: 0;
  }

  .Sidebar {
    /*border-bottom: 1px solid var(--mute-text);*/
    margin-left: 0;
    margin-bottom: 16px;
    padding: 0;
  }

  .SidebarBtnBar {
    display: flex;
  }

  .AppTitle {
    display: none;
  }

  .SidebarContent {
    display: none;
    padding-top: 20px;
    background-color: var(--popup-bg);
  }

  .SidebarContent a {
    padding-left: 8px;
  }

  .SidebarContent p {
    padding-left: 8px;
  }

  .SidebarContent.open {
    display: block;
  }
}


.VersionNum {
  color: var(--mute-text);
  font-style: italic;
}

#HomeLink {
}

.router-link-active {
  background-color: var(--link-hover-bg);
  /* background-color: var(--nice-red); */
  /* border-bottom: 2px solid var(--nice-red); */
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

</style>
