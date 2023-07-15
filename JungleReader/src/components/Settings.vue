<script setup>
import { ref, onMounted, computed } from 'vue'
import PluginEditor from './PluginEditor.vue'

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
  <div class="Settings">
    <h2>Settings</h2>
    <div class="SettingsSection">
      <h3>Persistent Storage</h3>
      <p>ToucanReader stores your config in your browser's storage. To make sure the browser doesn't
        automatically delete it to clear up space, turn on "persist". Even with this on, manually clearing
        your site data/cache will delete this data, so please export your config sometimes to back it up.</p>
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
      <p>Download plugins to add support for your favourite sites. See the GitHub page for a list of available plugins.</p>
      <p>Also see the GitHub if you'd like to develop a plugin.</p>
      <p>(Note that you cannot have multiple plugins with the same name/type.)</p>
      <PluginEditor />
    </div>
  </div>
</template>

<style scoped>
.SettingsSection {
  margin-bottom: 30px;
}
</style>
