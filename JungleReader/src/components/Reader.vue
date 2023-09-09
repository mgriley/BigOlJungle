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

function startImportConfig() {
  importConfigModal.value.showModal();
}

function importConfig() {
  const uploadedFile = importFileInput.value.files[0];
  if (!uploadedFile) {
    console.log("No file uploaded");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", (evt) => {
    // TODO - handle more errors here.
    if (!reader.result || reader.result === "") {
      console.log("The read file is invalid");
      return;
    }
    let success = gApp.importConfig(reader.result);  
    if (!success) {
      // TODO - show the error to the user
      console.log("Import failed!");
      return;
    }
    // TODO - trigger success toast
    importConfigModal.value.closeModal();
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
        <p class="AppTitle" @click="goToHome">
          Jungle<br>Reader
        </p>
        <div class="SideMenu">
          <div class="Section">
            <router-link to="/" id="HomeLink">Home</router-link>
            <router-link to="/explore">Explore</router-link>
          </div>
          <div class="Section">
            <a href="#" @click.prevent="startImportConfig()">Import Config</a>
            <a href="#" @click.prevent="gApp.exportConfig()">Export Config</a>
          </div>
          <div class="Section">
            <router-link to="/plugins">Plugins</router-link>
            <router-link to="/settings">Settings</router-link>
          </div>
          <div class="Section">
            <router-link to="/about">About</router-link>
            <router-link to="/getread">Get Read</router-link>
            <router-link to="/privacypolicy">Privacy Policy</router-link>
            <a href="https://forms.gle/HqavrHa7jQs4aRbd8" target="_blank">Report Bug <vue-feather type="external-link" size="16" /></a>
            <a href="https://github.com/mgriley/BigOlJungle" target="_blank">GitHub <vue-feather type="external-link" size="16" /></a>
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
  <BasicModal ref="importConfigModal" title="Import Config">
    <p>When you import a config, it will override your current config.</p>
    <p>You may want to export your current config first.</p>
    <div class="ImportBox">
      <input ref="importFileInput" type="file" id="input" />
    </div>
    <button @click="importConfig">Import</button>
  </BasicModal>
</template>

<style scoped>
.AppTitle {
  font-size: 2.5em;
  font-weight: 900;
  margin-bottom: 40px;
  line-height: 0.8em;
  letter-spacing: -2px;
  padding-bottom: 2px;
  cursor: pointer;
  /* border-bottom: 8px solid var(--main-text); */
  /* background-color: var(--main-text); */
  /* color: var(--main-bg); */
  /* padding: 10px; */
}

.toplevel {
  max-width: 1280px;
  margin: auto;
  display: grid;
  padding: 20px 10px;
  /*grid-gap: 20px;*/
  grid-template-columns: 280px 1fr;
  grid-template-areas: 
    "sidebar content"
}

.main {
  max-width: 100%;
  grid-area: content;
  /*background-color: #20bf6b;*/
  padding: 20px;
}

.Sidebar {
  grid-area: sidebar;
  padding: 20px 20px 0px 20px;
  margin-left: 20px;
  /*background-color: #45aaf2;*/
}

.SidebarContent {
  padding-bottom: 6px;
}

.SideMenu a {
  display: block;
  font-weight: bold;
  font-size: 1.0em;
  /* color: var(--mute-text); */
}

.SideMenu .Section:not(:last-child) {
  margin-bottom: 30px;
}

.SidebarBtnBar {
  display: none;
}

.SidebarBtn {
  border-radius: 0;
  font-size: 1.5rem;
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
  /* background-color: color-mix(in srgb, var(--main-text) 80%, black); */
  background-color: var(--main-text);
  color: var(--main-bg);
  /* border-width: 2px; */
  margin-left: auto;

  display: flex;
  align-items: center;
}

.SidebarBtn .MenuIcon {
  margin-left: 10px;
  padding-left: 10px;
}

/*
Display a single column on mobile.
Also collapse the menu.
*/
@media (max-width: 600px) {
  .toplevel {
    max-width: 100%;
    padding: 20px 20px;
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
    margin-bottom: 15px;
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
    padding-left: 10px;
  }

  .SidebarContent p {
    padding-left: 10px;
  }

  .SidebarContent.open {
    display: block;
  }
}


.VersionNum {
  color: var(--very-mute-text);
  font-style: italic;
}

#HomeLink {
  //font-size: 1.5rem;
  font-weight: 900;
}

.router-link-active {
  background-color: var(--link-hover-bg);
  //border-bottom: 1px solid black;
}

.ImportBox {
  margin-top: 10px;
}

.ImportBox input {
  font-size: 1rem;
  margin-bottom: 5px;
}

</style>
