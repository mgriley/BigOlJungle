<script setup>
import { ref, onMounted, computed } from 'vue'

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
    <p>
    ToucanReader is a free + open source web reader, made to help you keep up with the sites you like.
    It is designed for quick skimming, so you can skip to the good stuff.

    It supports RSS, YouTube, Reddit, Mastodon, Twitter, and more. It has a flexible plugin system that allows developers
    to add support for any other site / content sources. If your favourite site is not supported and you can't find a plugin for it 
    (or code one yourself), you can still follow it using the "Reminder" plugin. 

    Your data and reader config are stored locally in your browser. The data should stay
    around even if you clear your browser's cookie / data. Right now there is no device sync,
    so if you want to read on your phone and desktop, it is recommended that you set things up
    on desktop then export the config for your phone.

    To get started, click Tutorial.
    </p>

    <div>
      <p>ToucanReader stores your config in your browser's storage. To make sure the browser doesn't
        automatically delete it to clear up space, turn on "persist". Even with this on, manually clearing
        your site data/cache will delete this data, so please export your config sometimes to back it up.</p>
      <button v-if="!persistentStorageOn" @click="enablePersistentStorage">Turn On</button>
      <p>Persistent Storage: {{ persistentStorageOn }}</p>
    </div>

    <h3>Plugins:</h3>
  </div>
</template>

<style scoped>
</style>
