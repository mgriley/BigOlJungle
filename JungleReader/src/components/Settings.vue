<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import { getTimeAgoStr } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import PluginEditor from './PluginEditor.vue'
import CodeEditor from './CodeEditor.vue'
import QuickParseEditor from './QuickParseEditor.vue'
import BasicSelector from './BasicSelector.vue'

let persistentStorageOn = ref(false);

let supportedFetchMethods = [FetchMethod.JungleExt, FetchMethod.DevProxy]

/*
See:
https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
https://web.dev/persistent-storage/
*/
function enablePersistentStorage() {
	if (navigator.storage && navigator.storage.persist) {
  	navigator.storage.persist().then((persistent) => {
      persistentStorageOn.value = persistent;
		});
	} else {
    persistentStorageOn.value = false;
  }
}

onMounted(() => {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persisted().then((persistent) => {
      persistentStorageOn.value = persistent;
		});
  } else {
    persistentStorageOn.value = false;
  }
})

async function testFetchText() {
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
  <div class="SettingsContainer">
    <button class="SaveButton" @click="gApp.saveAll()">Save Changes</button>
    <div class="Settings">
      <h1>Settings</h1>
      <div class="SettingsSection">
        <h3>Persistent Storage</h3>
        <p>JungleReader stores your config in your browser's storage. To make sure the browser doesn't
          automatically delete it to clear up space, turn on "persist". Even with this on, manually clearing
          your site data/cache will delete this data, so please back up your config sometimes.</p>
        <h4 class="MarginTop Italic">Persistent Storage: {{ persistentStorageOn ? "On" : "Off" }}</h4>
        <button v-if="!persistentStorageOn" @click="enablePersistentStorage">{{ persistentStorageOn ? "Disable" : "Enable" }}</button>
      </div>
      <div class="SettingsSection">
        <h3>Cloud Sync</h3>
        <p>Connect your Google Drive account to backup and sync the reader between devices.</p>
        <h4 class="Italic">(Coming Soon!)</h4>
      </div>
      <div class="SettingsSection">
        <h3>Advanced</h3>
        <div class="SubSection">
          <h4>Fetch Method</h4>
          <p class="FetchDesc">
          By default, JungleReader will try to use JungleExt to make external web requests. 
          Soon, you'll be able to use a custom CORS proxy, instead, if you want. The DevProxy
          proxies requests to ToucanProxy running on localhost:8787.
          </p>
          <BasicSelector :value="gApp.fetchMethod.value" :options="supportedFetchMethods" @change="(newVal) => gApp.fetchMethod.value = newVal" />
        </div>
        <div class="SubSection">
          <h4>Other</h4>
          <button @click="gApp.setDoneWelcome(false)" class="SmallButton">Reset Welcome Page</button>
        </div>
        <div class="SubSection">
          <h4>Dev Zone</h4>
          <button @click="testFetchText" class="SmallButton">Test Fetch</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.SettingsContainer {
  position: relative;
}

.SaveButton {
  float: right;
}

.SettingsSection {
  margin-bottom: 30px;
}

.SubSection {
  margin-top: 10px;
  margin-bottom: 25px;
}

.FetchDesc {
  margin-bottom: 15px;
}
</style>
