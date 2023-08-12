<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
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

function launchTutorial() {
  // TODO
}

async function testJungleExt() {
  // let reply = await gApp.makeExtRequest({type: "echo", data: {hello: "world"}});
  /*
  let reply = await gApp.makeExtRequest({type: "fetch", data: "lol"});
  console.log("Got reply: ", reply);
  */
  let reply = await gApp.fetchText("https://news.ycombinator.com");
  console.log("Got reply: ", reply);
}

</script>

<template>
  <div class="toplevel">
    <div class="sidenav">
      <p class="AppTitle">JungleReader</p>
      <div class="SideMenu">
        <div class="Section">
          <div class="Flex">
            <button class="SaveButton" @click="gApp.saveAll()">Save</button>
            <!-- <h2 v-if="gApp.checkRequiresSave()">Must save!</h2> -->
          </div>
          <button @click="testJungleExt">Test Ext</button>
        </div>
        <div class="Section">
          <router-link to="/">My Feed</router-link>
          <router-link to="/starred">Starred</router-link>
          <router-link to="/history">History</router-link>
        </div>
        <div class="Section">
          <button @click="startImportConfig()">Import Config</button>
          <button @click="gApp.exportConfig()">Export Config</button>
        </div>
        <div class="Section">
          <a href="#" @click.prevent="launchTutorial()">Tutorial</a>
          <router-link to="/settings">Settings</router-link>
        </div>
        <div class="Section">
          <router-link to="/about">About / Donate</router-link>
          <a href="TODO" target="_blank">JungleWriter</a>
          <a href="https://github.com/mgriley/BigOlJungle" target="_blank">GitHub</a>
        </div>
      </div>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
  <BasicModal ref="importConfigModal">
    <h1>Import Config</h1>
    <p>When you import a config, it will override your current config.</p>
    <p>You may want to export your current config first.</p>
    <div>
      <input ref="importFileInput" type="file" id="input" />
    </div>
    <button @click="importConfig">Import</button>
  </BasicModal>
</template>

<style scoped>
.AppTitle {
  font-weight: bold;
  margin-bottom: 20px;
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

@media (max-width: 500px) {
  .wrapper {
    grid-template-columns: 4fr;
    grid-template-areas:
      "content"
      "sidebar"
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
  font-size: 0.8em;
  color: var(--mute-text);
}

.SideMenu .Section {
  margin-bottom: 30px;
}

</style>
