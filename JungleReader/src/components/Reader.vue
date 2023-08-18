<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr, kReaderVersionString } from '../State.js'
import BasicModal from 'Shared/BasicModal.vue'

/*
See:
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_sidenav_fixed2
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

</script>

<template>
  <div class="toplevel">
    <div class="sidenav">
      <p class="AppTitle" @click="goToHome">
        Jungle<br>Reader
      </p>
      <div class="SideMenu">
        <div class="Section">
          <router-link to="/" id="HomeLink">Home</router-link>
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
          <a href="TODO" target="_blank">JungleWriter</a>
          <a href="https://github.com/mgriley/BigOlJungle" target="_blank">GitHub</a>
        </div>
        <div class="Section">
          <p class="VersionNum">Version {{ kReaderVersionString }}</p>
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

/* Display a single column on mobile */
@media (max-width: 600px) {
  .toplevel {
    grid-template-columns: 1fr;
    grid-template-areas:
      "sidebar"
      "content";
  }

  .sidenav {
    border-bottom: 2px solid var(--main-text);
  }
}

.main {
  grid-area: content;
  /*background-color: #20bf6b;*/
  padding: 20px;
}

.sidenav {
  grid-area: sidebar;
  padding: 20px;
  margin-left: 20px;
  /*background-color: #45aaf2;*/
}

.SideMenu a {
  display: block;
  font-weight: bold;
  font-size: 1.0em;
  /* color: var(--mute-text); */
}

.SideMenu .Section {
  margin-bottom: 30px;
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
