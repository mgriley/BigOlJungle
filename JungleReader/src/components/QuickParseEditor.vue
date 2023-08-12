<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import { copyToClipboard, readFromJsonWithRollback,
  prettyJson, safeParseJson, getTimeAgoStr } from '../Utils.js'
import QuickParseNode from './QuickParseNode.vue'
import BasicModal from 'Shared/BasicModal.vue'

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
let showTutorial = ref(false);
let itemSetterModal = ref(null);
let selectedNodeObj = ref(null);

let pasteConfigModal = ref(null);
let pasteConfigText = ref("");

function toggleTutorial() {
  showTutorial.value = !showTutorial.value;
}

let domItems = computed(() => {
  return [
    {
      name: 'First Item Title',
      path: quickParser.firstItemTitle.path,
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
    {
      name: 'Second Item Title',
      path: quickParser.secondItemTitle.path,
      required: true,
    }
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

function copyConfig() {
  let config = JSON.stringify(quickParser.writeToJson(true));
  copyToClipboard(config);
}

function pasteConfig() {
  console.log("Paste Config:");
  pasteConfigModal.value.showModal();
  pasteConfigText.value = "";
}

function submitPasteConfig(configText) {
  // console.log("Parsing: " + configText);
  let configObj = safeParseJson(configText);
  if (!configObj) {
    return;
  }
  let origState = quickParser.writeToJson();
  try {
    quickParser.readFromJson(configObj, true);
  } catch (error) {
    console.error("Failed to read from json. Rolling back to original state.");
    // TODO - error toast
    quickParser.readFromJson(origState);
    return;
  }
  pasteConfigModal.value.closeModal();
}

</script>

<template>
  <div class="QuickParseEditor">
    <div class="Tutorial">
      <button @click="toggleTutorial">Tutorial</button>
      <div v-if="showTutorial">
        <p>
        Tutorial: Use the QuickParser to teach JungleReader how to read websites of a certain type, such as reddit feeds.
        You'll have to help by annotating the HTML page. Here's how:
        </p>
        <ul>
          <li>
          Step 1: Enter the URL of the website you'd like to read and press "Fetch".
          </li>
          <li>
          Step 2: You should see the page's raw HTML show up. Search through the HTML until you find the text of the items you'd
          like to read. For example, if the website shows a list of posts, first the HTML for the first post in the list.
          </li>
          <li>
          Step 3: See the list of colored items? You'll need to fill in the required ones. Click an HTML element in the HTML viewer,
          then set which item it is.
          </li>
          <li>
          Step 4: Once you have set the items, click "Run Test Parse". If you have set things up correctly, you should see the
          website's posts printed properly. Any missing items will be pointed out. If it's working, you're all done. You can use
          the custom feed name from your feeds page.
          </li>
        </ul>

        <p>
        Also Note: if the website you're reading has a complex structure, the QuickParser might not work on it. In that case, you may be
        able to use a "Text" type CustomPlugin to write a parser program. If the website changes its HTML, your feeds will show errors and
        you'll have to come back here to update the annotations.
        </p>
      </div>
    </div>
    <div class="ShareButtons">
      <button @click="copyConfig">Copy Config</button>
      <button @click="pasteConfig">Paste Config</button>
    </div>
    <div class="DomItems">
      <h3>Parser Paths</h3>
      <ul>
        <li v-for="item in domItems">
          <div class="Flex">
            <p>{{ item.name }}{{ item.required ? "[Required]" : "[Optional]" }}</p>
            <p>{{ item.path.toShortStr() }}</p>
          </div>
        </li>
      </ul>
    </div>
    <div class="TestContent">
      <p>Test URL</p>
      <input v-model="plugin.quickParser.testUrl" class="Block UrlInput" placeholder="Ex. https://news.ycombinator.com" size="40">
      <button @click="plugin.quickParser.fetchTestContent()">Fetch Test Page</button>
      <div class="DomTree">
        <template v-if="plugin.quickParser.testFetchContent !== null">
          <QuickParseNode :nodeData="plugin.quickParser.testFetchContent" :childNum="0" :numChildren="1"
            @selectNode="onSelectTestNode" />
        </template>
        <template v-else>
          <p>Nothing here yet.</p>
        </template>
      </div>
    </div>
    <div>
      <p>Test Output</p>
      <button @click="plugin.quickParser.runTestParse()">Run Test Parse</button>
      <div class="TestOutputBox">
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
      </div>
    </div>
  </div>
  <BasicModal ref="itemSetterModal">
    <div v-for="item in domItems" class="Flex">
      <button class="SetItemBtn" @click="setDomItem(item)">Set</button>
      <button class="ClearItemBtn" @click="clearDomItem(item)">Clear</button>
      <p>{{ item.name }}: {{ item.path.toShortStr() }}</p>
    </div>
  </BasicModal>
  <BasicModal ref="pasteConfigModal">
    <h3>Paste Config</h3>
    <textarea class="PasteBox Block" v-model="pasteConfigText" placeholder="Paste here."></textarea>
    <button @click="submitPasteConfig(pasteConfigText)">Import</button>
  </BasicModal>
</template>

<style scoped>

.DomItems {
  margin: 20px 0px;
}

.DomTree {
  margin-top: 20px;
  margin-bottom: 40px;
  border: 2px solid black;
  padding: 10px;
}

.TestOutputBox {
  margin: 20px 0px;
  border: 2px solid black;
  padding: 10px;
  white-space: pre;
}

.Tutorial {
  margin-bottom: 40px;
}

.SetItemBtn {
  margin-right: 5px;
}

.ClearItemBtn {
  margin-right: 15px;
}

.PasteBox {
  width: 800px;
  height: 300px;
}

</style>
