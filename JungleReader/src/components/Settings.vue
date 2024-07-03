<script setup>
import { ref, onMounted, computed } from 'vue'
import { JungleReader, gApp, FetchMethod, FeedGroup, Feed, kAppStateKey } from '../State.js'
import { getTimeAgoStr } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import BasicSelector from './BasicSelector.vue'

let fetchMethodOpen = ref(false);
let persistentStorageOn = ref(false);

let supportedFetchMethods = [
  FetchMethod.ToucanProxy,
  FetchMethod.JungleExt,
  FetchMethod.DevProxy
]

let enableDevZone = ref(false);
let devZoneOpen = ref(false);

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

async function testFetchText() {
  // let reply = await gApp.makeExtRequest({type: "echo", data: {hello: "world"}});
  /*
  let reply = await gApp.makeExtRequest({type: "fetch", data: "lol"});
  console.log("Got reply: ", reply);
  */
  let reply = await gApp.fetchText("https://news.ycombinator.com");
  console.log("Got reply: ", reply);
}

function addTestFeeds() {
  let feeds = [
    {
      name: "TerenceTao",
      type: "Mastodon",
      url: "https://mathstodon.xyz/@tao",
    },
    {
      name: "CreatingGames",
      type: "YouTube",
      url: "https://www.youtube.com/@sora_sakurai_en",
    },
    {
      name: "CBC World News",
      type: "RSS",
      url: "https://www.cbc.ca/webfeed/rss/rss-world",
    }
  ];

  let group = FeedGroup.create();
  group.name = "Test Group";
  gApp.feedReader.addFeedGroup(group);
  for (const feedData of feeds) {
    let feed = Feed.create();
    feed.name = feedData.name;
    feed.type = feedData.type;
    feed.url = feedData.url;
    group.addFeed(feed);
  }
}

function dumpLocalStorage() {
  let keys = [];
  for (let i = 0; i < localStorage.length; ++i) {
    keys.push(localStorage.key(i));
  }
  keys.sort();
  for (let i = 0; i < keys.length; ++i) {
    let key = keys[i];
    let val = localStorage.getItem(key);
    console.log(`${i}: ${key}:\n${val}`);
  }
}

function doBadLoad() {
  console.log("Performing bad store and load");
  localStorage.setItem(kAppStateKey, `{"groups": 123132131}`);
  gApp.readStateFromStorage();
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
  <div class="SettingsContainer">
    <div class="Settings">
      <h1 class="PageHeader">Settings</h1>
      <div class="SettingsSection">
        <h3 class="NoUnderline">Basic</h3>
        <h4>Cloud Sync</h4>
        <p class="SmallText">Connect your Google Drive account to backup and sync the reader between devices.</p>
        <p class="MutedHeader">(Coming Soon!)</p>
      </div>
      <div v-if="JungleReader.getPlatform() == 'web'" class="SettingsSection">
        <h3 class="NoUnderline">Advanced</h3>
        <div class="MarginBotXS">
          <h4>Persistent Storage</h4>
          <p class="SmallText">JungleReader stores your config in your browser's storage. To make sure the browser doesn't
            automatically delete it to clear up space, turn on "persist".</p>
          <p class="MutedHeader MarginTop">Persistent Storage: {{ persistentStorageOn ? "On" : "Off" }}</p>
          <button v-if="!persistentStorageOn" @click="enablePersistentStorage">{{ persistentStorageOn ? "Disable" : "Enable" }}</button>
        </div>
        <div class="">
          <h4 class="MockButton" @click="fetchMethodOpen = !fetchMethodOpen">Fetch Method{{ fetchMethodOpen ? '' : '...'}}</h4>
          <div v-if="fetchMethodOpen">
            <p class="FetchDesc SmallText">
            By default, JungleReader proxies requests through our proxy server called ToucanProxy. 
            It does not collect data.
            If you prefer, you can also use a custom proxy server (coming soon) or download the JungleExt browser extension (on the web version).
            The DevProxy proxies requests to ToucanProxy running on localhost:8787.
            </p>
            <BasicSelector :value="gApp.fetchMethod.value" :options="supportedFetchMethods"
              @change="(newVal) => gApp.fetchMethod.value = newVal" class="MarginBotM" />
          </div>
        </div>
        <!-- Hidden btn to show the Dev zone -->
        <div v-if="!enableDevZone" @click="enableDevZone = true" class="HiddenBtn">
          HiddenBtn
        </div>
        <div v-if="enableDevZone" class="SubSection">
          <h4 class="MockButton" @click="devZoneOpen = !devZoneOpen">Dev Zone{{ devZoneOpen ? "" : "..."}}</h4>
          <template v-if="devZoneOpen">
            <button @click="gApp.resetWelcomePages()" class="SmallButton Block">Reset Welcome Page</button>
            <button @click="gApp.saveAll(true)" class="SmallButton Block">Manually save all</button>
            <button @click="addTestFeeds" class="SmallButton Block">Add test feeds</button>
            <button @click="testFetchText" class="SmallButton Block">Test Fetch</button>
            <button @click="dumpLocalStorage" class="SmallButton Block">Dump localStorage</button>
            <button @click="gApp.fullyReset()" class="SmallButton Block">Fully reset app (DANGER)</button>
            <button @click="doBadLoad" class="SmallButton Block">Do bad load (DANGER)</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.SettingsContainer {
  position: relative;
}

.SettingsSection {
  margin-bottom: var(--space-m);
}

.SubSection {
  margin-top: 8px;
  margin-bottom: var(--space-s);
}

.FetchDesc {
  margin-bottom: 16px;
}

.SmallButton {
  margin: 4px 0;
}

.MutedHeader {
  font-weight: bold;
  color: var(--secondary-text);
}

.HiddenBtn {
  margin-top: 8px;
  color: transparent;
}
</style>
