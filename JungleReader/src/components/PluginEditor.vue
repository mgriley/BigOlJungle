<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { removeElem } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import BasicModal from 'Shared/BasicModal.vue'
import OptionsInput from './OptionsInput.vue'
import BasicSelector from './BasicSelector.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import TextTreeIcon from './TextTreeIcon.vue'

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

</script>

<template>
  <div class="PluginEditor">
    <div class="PluginList">
      <div v-for="plugin in gApp.customPlugins" class="Plugin">
        <div class="MainEntries">
          <div class="NameBox Flex">
            <TextTreeIcon class="TreeToggle" :expanded="plugin.expandedInUi" @click="plugin.expandedInUi = !plugin.expandedInUi" />
            <h3 class="NameHeader Block MockButton" :class="{Disabled: !plugin.isEnabled}" @click="plugin.expandedInUi = !plugin.expandedInUi">{{ plugin.feedType }}</h3>
            <ToggleSwitch label="Enabled" v-model="plugin.isEnabled" />
          </div>
          <div v-if="plugin.expandedInUi" class="PluginDetails">
            <div class="NameTypeBox Flex FieldEntry">
              <div>
                <div class="FieldName">Name</div>
                <input v-model="plugin.feedType" class="BasicTextInput Block NameInput" placeholder="Ex. MyPlugin">
              </div>
              <div>
                <div class="FieldName">Type</div>
                <BasicSelector :value="plugin.pluginType" :options="supportedPluginTypes" @change="(newVal) => onChangePluginType(plugin, newVal)" />
              </div>
            </div>
            <div class="EditorField">
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
            </div>
            <div class="Options FieldEntry">
              <div class="FieldName CustomOptionsField">Custom Options</div>
              <OptionsInput :options="plugin.options" />
            </div>
            <button class="DeleteButton" @click="removePlugin(plugin)">Delete Plugin</button>
          </div>
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
  margin-top: 20px;
}

.MainEntries {
  margin-bottom: 10px;
}

.NameBox {
  align-items: baseline;  
}

.TreeToggle {
  font-size: 1.5rem;
  margin-right: 10px;
}

.NameHeader {
  margin-right: 10px;
}

.Disabled {
  color: var(--very-mute-text);
}

.NameInput {
  width: 300px;
  margin-right: 20px;
}

.UrlInput {
  width: 400px;
}


.FieldName {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.FieldEntry {
  margin-bottom: 5px;
}

.EditorField {
  margin-bottom: 15px;
}

.EditorBtn {
  margin-top: 15px;
}

.Options {
  margin-bottom: 20px;
  width: 500px;
}

.CustomOptionsField {
  font-size: 1rem;
}

.PluginDetails {
  width: 800px;
  padding: 10px 15px;
  border: 2px solid var(--main-text);
}

</style>
