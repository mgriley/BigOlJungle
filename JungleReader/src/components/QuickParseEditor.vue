<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import { copyToClipboard, readFromJsonWithRollback,
  prettyJson, safeParseJson, getTimeAgoStr, downloadTextFile } from '../Utils.js'
import QuickParseNode from './QuickParseNode.vue'
import QuickParseField from './QuickParseField.vue'
import BasicModal from 'Shared/BasicModal.vue'
import MoreInfoText from './MoreInfoText.vue'

/*
Format:

General plugin info.
- Plugin Name
- Enabled/disabled
- Options

Test URL.
Big HTML viewer/editor. (Tree view where can click elems)
Click elems to set the right content.
To click:
- Item title
- Item url
- Item pts / extra info
- Item date
*/

const props = defineProps(['plugin'])

let quickParser = props.plugin.quickParser;
let itemSetterModal = ref(null);
let selectedNodeObj = ref(null);

let pasteConfigModal = ref(null);
let pasteConfigText = ref("");

let runningFetchTestContent = ref(false);
let fetchTestContentError = ref(null);

let runningTestParse = ref(false);
let testParseError = ref(null);

let domItems = computed(() => {
  return [
    {
      name: 'First Item Title',
      path: quickParser.firstItemTitle.path,
      required: true,
    },
    {
      name: 'Second Item Title',
      path: quickParser.secondItemTitle.path,
      required: true,
    },
    {
      name: 'First Item Link',
      path: quickParser.firstItemUrl.path,
      required: false,
    },
    {
      name: 'First Item Date',
      path: quickParser.firstItemDate.path,
      required: false,
    },
    {
      name: 'First Item Author',
      path: quickParser.firstItemAuthor.path,
      required: false,
    },
    {
      name: 'First Item Points',
      path: quickParser.firstItemPts.path,
      required: false,
    },
  ]
})

function openItemSetterModal(nodeData) {
  console.log("Opening ItemSettingModal");
  selectedNodeObj.value = nodeData;
  itemSetterModal.value.showModal();
}

function setDomItem(domItem) {
  quickParser.setPathFromNodeData(domItem.path, selectedNodeObj.value);
}

function clearDomItem(domItem) {
  quickParser.clearPath(domItem.path);
}

function onSelectTestNode(node) {
  // console.log(node);
  openItemSetterModal(node);
}

function exportConfig() {
  console.log("Exporting script");
  let pluginData = {
    version: "1.0",
    type: "QuickParse",
    data: {
      config: quickParser.writeToJson(true),
    }
  };
  let jsonData = prettyJson(pluginData);
  downloadTextFile(jsonData, `${props.plugin.feedType}.json`);
  console.log(jsonData);
}

function importConfig() {
  gApp.toast({message: "Not yet implemented. Coming soon.", type: "error"});
}

// TODO - no longer used
function pasteConfig() {
  console.log("Paste Config:");
  pasteConfigModal.value.showModal();
  pasteConfigText.value = "";
}

function submitPasteConfig(configText) {
  // console.log("Parsing: " + configText);
  let configObj = safeParseJson(configText);
  if (!configObj) {
    gApp.toast({message: "Failed to parse config. Check for errors.", type: "error"});
    return;
  }
  let origState = quickParser.writeToJson();
  try {
    quickParser.readFromJson(configObj, true);
  } catch (error) {
    console.error("Failed to read from json. Rolling back to original state.");
    quickParser.readFromJson(origState);
    gApp.toast({message: "Failed to read the config. Check it for errors.", type: "error"});
    return;
  }
  gApp.toast({message: "Imported config", type: "success"});
}

async function fetchTestContent() {
  console.log("Fetching test content...");
  runningFetchTestContent.value = true;
  try {
    await props.plugin.quickParser.fetchTestContent();
    fetchTestContentError.value = null;
  } catch (error) {
    console.log("Error on fetch: ", error);
    fetchTestContentError.value = "Error fetching test content. " +
      "Please check the url and see the console logs for details.";
  }
  runningFetchTestContent.value = false;
  console.log("Done fetch");
}

async function runTestParse() {
  runningTestParse.value = true;  
  try {
    await props.plugin.quickParser.runTestParse();
    testParseError.value = null;
  } catch (error) {
    testParseError.value = "Error running test parse. Please check console logs for details.";
  }
  runningTestParse.value = false;
}

</script>

<template>
  <div class="QuickParseEditor">
    <div class="Flex TitleBox">
      <h3>QuickParse Editor</h3>
      <div class="ShareButtons">
        <button class="TertiaryButton" @click="importConfig">Import Config</button>
        <button class="TertiaryButton" @click="exportConfig">Export Config</button>
      </div>
    </div>
    <div class="FirstSection">
      <MoreInfoText class="Tutorial" text="How does this work?" >
        <p>
        Make a <b>QuickParse</b> plugin to parse simple feed or post-based webpages.
        You'll need some basic knowledge of HTML.
        </p>
        <p>
        To create the plugin, just follow the steps below. You will enter a representative page you'd like to parse, annotate it, then
        check that the output is expected. Once done, the QuickParse plugin will know how to create feeds from any pages that follow the
        same format.
        </p>
        <p>
        <b>Sharing your plugin:</b> You can do "Copy config" then tells others to "Paste Config".
        You can also do "Copy config" then host the file online, like at https://www.yoursite.com/myplugin.json. Other users
        can add your plugin by creating a "URL" plugin with that URL.
        </p>
        <p>
        <b>Also Note:</b> if the website you're reading has a complex structure, QuickParse may not work for you. In that case, 
        try a "Script" plugin instead. If the website changes its HTML, your feeds will show errors and
        you'll have to come back here to update the annotations.
        </p>
      </MoreInfoText>
    </div>
    <div class="Step">
      <h4>Step 1 - Enter test url</h4>
      <div class="FormFieldInfo">Ex. https://news.ycombinator.com</div>
      <input v-model="plugin.quickParser.testUrl" class="BasicTextInput UrlInput" size="40">
    </div>
    <div class="Step">
      <h4>Step 2 - Annotate</h4>
      <p>
      Click 'Start annotating', then fill in the items below by finding and clicking them
      in the HTML.
      </p>
      <div class="DomItems">
        <QuickParseField v-for="item in domItems" :item="item" />
      </div>
      <button @click="fetchTestContent()">Start annotating</button>
      <div class="DomTree">
        <p v-if="runningFetchTestContent" class="MarginBotS">Running...</p>
        <template v-if="fetchTestContentError">
          {{ fetchTestContentError }}
        </template>
        <template v-else>
          <template v-if="plugin.quickParser.testFetchContent !== null">
            <QuickParseNode :nodeData="plugin.quickParser.testFetchContent" :childNum="0" :numChildren="1"
              @selectNode="onSelectTestNode" />
          </template>
          <template v-else>
            <p>Nothing here yet.</p>
          </template>
        </template>
      </div>
    </div>
    <div class="Step">
      <h4>Step 3 - Check output</h4>
      <button @click="runTestParse()">Run check</button>
      <div class="TestOutputBox">
        <p v-if="runningTestParse" class="MarginBotS">Running...</p>
        <template v-if="testParseError">
          <p>{{ testParseError }}</p>
        </template>
        <template v-else>
          <template v-if="plugin.quickParser.testParseOutput !== null">
            <ol>
              <li v-for="item in plugin.quickParser.testParseOutput">
                <p>Title: {{ item.title }}</p>
                <p v-if="item.url">Url: {{ item.url }}</p>
                <p v-if="item.date">Date: {{ item.date }}</p>
                <p v-if="item.author">Author: {{ item.author }}</p>
                <p v-if="item.points">Points: {{ item.points }} </p>
              </li>
            </ol>
          </template>
          <template v-else>
            <p>Nothing here yet</p>
          </template>
        </template>
      </div>
    </div>
  </div>
  <BasicModal ref="itemSetterModal">
    <p>This element is the...</p>
    <div class="ItemSetterList">
      <div v-for="item in domItems" class="ItemSetterItem Flex">
        <button class="SetItemBtn TertiaryButton" @click="setDomItem(item)">Set</button>
        <button class="ClearItemBtn TertiaryButton" @click="clearDomItem(item)">Clear</button>
        <QuickParseField :item="item" />
      </div>
    </div>
  </BasicModal>
  <BasicModal ref="pasteConfigModal" title="Paste Config"
    doneText="Import" @onDone="submitPasteConfig(pasteConfigText)">
    <textarea class="PasteBox Block" v-model="pasteConfigText" placeholder="Paste here."></textarea>
  </BasicModal>
</template>

<style scoped>

.TitleBox {
  margin-top: var(--space-xl);
  margin-bottom: var(--space-xs);
}

.FirstSection {
  margin-bottom: var(--space-l);
}

.ShareButtons {
  margin-left: auto;
}

.ShareButtons {
  display: flex;
  flex-flow: row wrap;
  gap: var(--space-xs);
}

.Tutorial {
  margin-bottom: var(--space-m);
}

.Tutorial p {
  margin-bottom: var(--space-m);
}

.Step {
  margin-bottom: var(--space-l);
}

.Step h4 {
  margin-bottom: var(--space-xs);
}

.DomItems {
  margin-bottom: var(--space-m);
}

.DomTree {
  margin: 8px 0px 24px 0px;
  border: 1px solid var(--secondary-text);
  border-radius: var(--border-radius-small);
  padding: 8px;
}

.TestOutputBox {
  margin: 8px 0px 24px 0px;
  border: 1px solid var(--secondary-text);
  border-radius: var(--border-radius-small);
  padding: 8px;
  white-space: pre;
}

.ItemSetterItem {
}

.SetItemBtn {
  margin-right: 8px;
}

.ClearItemBtn {
  margin-right: 8px;
}

.PasteBox {
  width: 800px;
  height: 300px;
}

.AnnotateItemList {
}

</style>
