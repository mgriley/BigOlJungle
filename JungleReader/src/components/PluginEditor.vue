<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { removeElem } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import BasicModal from 'Shared/BasicModal.vue'
import OptionsInput from './OptionsInput.vue'
import BasicSelector from './BasicSelector.vue'
import ToggleSwitch from './ToggleSwitch.vue'

let optionsEditorModal = ref(null);
let pluginToEdit = ref(null);

let supportedPluginTypes = [CustomPluginType.URL, CustomPluginType.Text];

function addPlugin() {
  let plugin = new CustomPlugin();
  gApp.customPlugins.push(plugin);
}

function removePlugin(plugin) {
  removeElem(gApp.customPlugins, plugin);
}

function editOptions(plugin) {
  pluginToEdit.value = plugin;
  optionsEditorModal.value.showModal();  
}

function onChangePluginType(plugin, newType) {
  plugin.pluginType = newType;
}

function openTextEditor(plugin) {
  gApp.setPluginToEdit(plugin);
}

</script>

<template>
  <div class="PluginEditor">
    <div class="PluginList">
      <button class="AddPluginBtn" @click="addPlugin">Add Plugin</button>
      <div v-for="plugin in gApp.customPlugins" class="Plugin">
        <div class="MainEntries Flex">
          <input v-model="plugin.feedType" class="Block FeedInput" placeholder="Ex. MyPlugin">
          <BasicSelector :value="plugin.pluginType" :options="supportedPluginTypes" @change="(newVal) => onChangePluginType(plugin, newVal)" />
          <template v-if="plugin.pluginType == CustomPluginType.URL">
            <input v-model="plugin.pluginUrl" class="Block UrlInput" placeholder="Ex. https://www.myplugins.com/plugin.js">
          </template>
          <template v-else>
            <button @click="openTextEditor(plugin)">Edit text</button>
          </template>
          <button @click="editOptions(plugin)">Options</button>
          <ToggleSwitch label="Enabled" v-model="plugin.isEnabled" />
          <button @click="removePlugin(plugin)">X</button>
        </div>
      </div>
    </div>
  </div>
  <BasicModal ref="optionsEditorModal">
    <h2>{{ pluginToEdit.feedType }}</h2>
    <p>Add optional custom options here:</p>
    <OptionsInput :options="pluginToEdit.options" />
  </BasicModal>
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
</style>
