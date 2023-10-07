<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { prettyJson, downloadTextFile } from '../Utils.js'
import { updateFeedFromScript } from '../ScriptParse.js'
import * as docs from '../ScriptingDocs.js'
import MoreInfoText from './MoreInfoText.vue'
import BasicModal from 'Shared/BasicModal.vue'

// See: https://github.com/koca/vue-prism-editor/tree/feature/next
// PrismEditor Config {
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css';

// }

const props = defineProps(['plugin']);

let scriptParser = props.plugin.scriptParser;

let importScriptModal = ref(null);
let importScriptText = ref("");

let isTestRunning = ref(false);

function highlighter(code) {
  return Prism.highlight(code, Prism.languages.javascript);
}

function exportScript() {
  console.log("Exporting script");
  let scriptData = {
    version: "1.0",
    type: "script",
    data: {
      text: scriptParser.pluginText.split("\n"),
    }
  };
  let jsonData = prettyJson(scriptData);
  downloadTextFile(jsonData, `${props.plugin.feedType}.json`);
  console.log(jsonData);
}

function importScript() {
  // TODO
  /*
  console.log("Paste Config:");
  pasteConfigModal.value.showModal();
  pasteConfigText.value = "";
  */
}

function submitPasteConfig(configText) {
  // TODO - fix up
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

function sigToStr(funcSig) {
  if (typeof funcSig == 'string') {
    return funcSig;
  } else {
    return funcSig.join("\n");
  }
}

async function runTestParse() {
  let testFeed = Feed.create();
  testFeed.name = "TestFeed";
  testFeed.type = props.plugin.feedType;
  testFeed.url = scriptParser.testUrl;
  testFeed.options = [];

  console.log("Running test parse for: " + scriptParser.testUrl);
  isTestRunning.value = true;
  try {
    await updateFeedFromScript(props.plugin, scriptParser.pluginText, testFeed);
  } catch (err) {
    console.error(err);
  }
  isTestRunning.value = false;  
}

</script>

<template>
  <div>
    <div class="ScriptEditor">
      <div class="Flex ScriptEditorHeader">
        <h3 class="SectionHeader">Script Editor</h3>
        <div class="ShareButtons">
          <button class="TertiaryButton" @click="importScript">Import Script</button>
          <button class="TertiaryButton" @click="exportScript">Export Script</button>
        </div>
      </div>
      <!-- <textarea v-model="value"></textarea> -->
      <prism-editor class="my-editor" v-model="scriptParser.pluginText" :highlight="highlighter" line-numbers></prism-editor>
    </div>
    <div class="TestSection">
      <h3 class="SectionHeader">Test</h3>
      <div class="FormFieldNameWithInfo TestUrlLabel">Test URL</div>
      <div class="FormFieldInfo">Ex. https://news.ycombinator.com </div>
      <input v-model="scriptParser.testUrl" class="Block BasicTextInput WideInput TestUrl">
      <button class="MarginBotXS" @click="runTestParse">Run Test</button>
      <p v-if="isTestRunning">Running...</p>
      <p>Check the dev console for the plugin output.</p>
    </div>
    <div class="DocsSection">
      <h3 class="SectionHeader">Docs</h3>
      <MoreInfoText class="Tutorial" text="How does this work?">
        Lol hi
      </MoreInfoText>
      <div class="DocsContainer">
        <div v-for="group in docs.functionDocs" class="GroupDoc">
          <!-- <h4>{{ group.name }}</h4> -->
          <div v-for="func in group.funcs" class="FuncDoc">
            <p class="FuncSig">
              {{ sigToStr(func.sig) }}
            </p>
            <p class="FuncDesc">{{ func.desc }}</p>
            <p class="FuncEx"><u>Ex</u> {{ func.ex }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.ScriptEditor {
  margin-bottom: var(--space-xl);
}

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: var(--p-size);
  line-height: var(--main-line-height);
  padding: 4px;
}

/* optional class for removing the outline */
/*
.prism-editor__textarea:focus {
  outline: none;
}
*/

.SectionHeader {
}

.ScriptEditorHeader {
  margin-bottom: var(--space-xs);
}

.ShareButtons {
  display: flex;
  flex-flow: row wrap;
  gap: var(--space-xs);
  margin-left: auto;
}

.TestSection {
  margin-bottom: var(--space-xl);
}

.TestUrlLabel {
  margin-top: 0;
}

.TestUrl {
  margin-bottom: var(--space-m);
}

.TestOutputBox {
  font-family: monospace;
  margin: 8px 0px var(--space-l) 0px;
  border: 1px solid var(--secondary-text);
  border-radius: var(--border-radius-small);
  padding: 8px;
  white-space: pre;
}

.Tutorial {
  margin-bottom: var(--space-l);
}

.GroupDoc {
  margin-bottom: var(--space-xl);
}

.FuncDoc {
  margin-bottom: var(--space-s);
}

.FuncSig {
  font-weight: bold;
  color: var(--main-text);
  font-family: monospace;
  white-space: pre;
  line-height: 1.4;
}

.FuncEx {
  margin-top: var(--space-xs);
  font-family: monospace;
  white-space: pre;
}


</style>
