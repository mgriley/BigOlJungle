<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import PluginEditor from './PluginEditor.vue'
import CodeEditor from './CodeEditor.vue'

let persistentStorageOn = ref(false);

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
    <CodeEditor class="CodeEditor" v-model="gApp.getPluginToEdit().pluginText" />
    <div>
      <h2>Docs</h2>
      <p>TODO</p>
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
      <p>Connect your Google Drive account to backup and sync your reading config.</p>
      <p>TODO</p>
    </div>
    <div class="SettingsSection">
      <h3>Plugins</h3>
      <p>Download plugins to add support for your favourite sites. See the GitHub for links to some plugins.</p>
      <p>If you'd like to develop a plugin, please see the GitHub :)</p>
      <p>(Note that you cannot have multiple plugins with the same name/type.)</p>
      <PluginEditor />
    </div>
    <div class="SettingsSection">
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
