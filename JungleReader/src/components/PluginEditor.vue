<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { removeElem } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import BasicModal from 'Shared/BasicModal.vue'
import OptionsInput from './OptionsInput.vue'
import BasicSelector from './BasicSelector.vue'
import ToggleSwitch from './ToggleSwitch.vue'

let pluginToEdit = ref(null);

let supportedPluginTypes = [
  CustomPluginType.URL,
  CustomPluginType.QuickParse,
  CustomPluginType.Text,
];

function addPlugin() {
  let plugin = new CustomPlugin(gApp);
  gApp.customPlugins.push(plugin);
}

function removePlugin(plugin) {
  removeElem(gApp.customPlugins, plugin);
}

function onChangePluginType(plugin, newType) {
  plugin.pluginType = newType;
}

function openEditor(plugin) {
  gApp.setPluginToEdit(plugin);
}

function openQuickParseEditor(plugin) {
  // TODO
}

</script>

<template>
  <div class="PluginEditor">
    <div class="PluginList">
      <div v-for="plugin in gApp.customPlugins" class="Plugin">
        <div class="MainEntries">
          <div class="Header Flex">
            <input v-model="plugin.feedType" class="BasicTextInput Block FeedInput" placeholder="Ex. MyPlugin">
            <ToggleSwitch label="Enabled" v-model="plugin.isEnabled" />
          </div>
          <div class="FieldName">Type</div>
          <BasicSelector :value="plugin.pluginType" :options="supportedPluginTypes" @change="(newVal) => onChangePluginType(plugin, newVal)" />
          <template v-if="plugin.pluginType == CustomPluginType.URL">
            <div class="FieldName">Url</div>
            <input v-model="plugin.pluginUrl" class="Block UrlInput" placeholder="Ex. https://www.myplugins.com/plugin.js">
          </template>
          <template v-else-if="plugin.pluginType == CustomPluginType.Text">
            <button class="EditorBtn" @click="openEditor(plugin)">Open Editor</button>
          </template>
          <template v-else-if="plugin.pluginType == CustomPluginType.QuickParse">
            <button class="EditorBtn" @click="openEditor(plugin)">Open Editor</button>
          </template>
          <div class="Options">
            <div class="FieldName">Custom Options</div>
            <OptionsInput :options="plugin.options" />
          </div>
          <button class="DeleteButton" @click="removePlugin(plugin)">Delete Plugin</button>
        </div>
      </div>
      <button class="AddPluginBtn" @click="addPlugin">Add Plugin</button>
    </div>
  </div>
</template>

<style scoped>
.PluginList {
  margin-top: 15px;
}

.AddPluginBtn {
  margin-bottom: 10px;
}

.MainEntries {
  gap: 10px;
  margin-bottom: 10px;
  margin-top: 10px;
}

.FeedInput {
  width: 200px;
}

.UrlInput {
  width: 400px;
}


.FieldName {
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.5;
  margin-top: 10px;
}

.EditorBtn {
  margin-top: 15px;
}

.Options {
  margin-bottom: 20px;
  width: 500px;
}

</style>
