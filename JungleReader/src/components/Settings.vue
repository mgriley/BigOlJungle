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

</script>

<template>
  <div class="TextPluginEditor" v-if="gApp.getPluginToEdit()">
    <button class="DoneButton" @click="gApp.setPluginToEdit(null)">Back to Settings</button>  
    <h2 class="PluginName">{{ gApp.getPluginToEdit().feedType }}</h2>
    <div v-if="gApp.getPluginToEdit().pluginType == CustomPluginType.Text">
      <CodeEditor class="CodeEditor" v-model="gApp.getPluginToEdit().pluginText" />
    </div>
    <div v-else-if="gApp.getPluginToEdit().pluginType == CustomPluginType.QuickParse">
      <QuickParseEditor :plugin="gApp.getPluginToEdit()" />
    </div>
  </div>
  <div v-else class="Settings">
    <h2>Settings</h2>
    <div class="SettingsSection">
      <h3>Persistent Storage</h3>
      <p>JungleReader stores your config in your browser's storage. To make sure the browser doesn't
        automatically delete it to clear up space, turn on "persist". Even with this on, manually clearing
        your site data/cache will delete this data, so please back up your config sometimes.</p>
      <button v-if="!persistentStorageOn" @click="enablePersistentStorage">Turn On</button>
      <p>Persistent Storage: {{ persistentStorageOn }}</p>
    </div>
    <div class="SettingsSection">
      <h3>Google Drive Sync</h3>
      <p>Connect your Google Drive account to backup and sync the reader between devices.</p>
      <p>(Coming Soon!)</p>
    </div>
    <div class="SettingsSection">
      <h3>Plugins</h3>
      <p>Download or create plugins to add support for your favourite sites.</p>
      <p>If you'd like to develop a plugin, please see the GitHub for more info :)</p>
      <p>(Note that you cannot have multiple plugins with the same name.)</p>
      <PluginEditor />
    </div>
    <div class="SettingsSection">
      <h3>Advanced</h3>
      <div>
        <h4>Fetch Method</h4>
        <p>
        By default, JungleReader will try to use JungleExt to make external web requests. 
        Soon, you'll be able to use a custom CORS proxy, instead, if you want. The DevProxy
        proxies requests to ToucanProxy running on localhost:8787.
        </p>
        <BasicSelector :value="gApp.fetchMethod.value" :options="supportedFetchMethods" @change="(newVal) => gApp.fetchMethod.value = newVal" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.TextPluginEditor .PluginName {
  margin-bottom: 10px;
}

.CodeEditor {
  margin-bottom: 40px;
}

.DoneButton {
  margin-bottom: 40px;
}

.SettingsSection {
  margin-bottom: 30px;
}
</style>
