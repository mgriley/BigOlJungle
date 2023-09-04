<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { removeElem } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
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
                <input v-model="plugin.feedType" class="BasicTextInput Block NameInput" placeholder="Ex. MyPlugin" type="text">
              </div>
              <div>
                <div class="FieldName">Type</div>
                <BasicSelector :value="plugin.pluginType" :options="supportedPluginTypes" @change="(newVal) => onChangePluginType(plugin, newVal)" />
              </div>
            </div>
            <div class="EditorField">
              <template v-if="plugin.pluginType == CustomPluginType.URL">
                <div class="FieldName">Url</div>
                <input v-model="plugin.pluginUrl" class="BasicTextInput Block UrlInput" placeholder="Ex. https://www.myplugins.com/plugin.js" type="text">
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
            <div v-if="plugin.pluginType == CustomPluginType.Text" class="Options FieldEntry">
              <div class="FieldName CustomOptionsField">Domain Whitelist</div>
              <OptionsInput :options="plugin.domainWhitelist" :hasKeys="false" />
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
  margin-right: 20px;
}

.UrlInput {
  width: 30ch;
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
  /* max-width: 500px; */
}

.CustomOptionsField {
  font-size: 1rem;
}

.PluginDetails {
  /*max-width: 800px;*/
  padding: 10px 15px;
  border: 2px solid var(--mute-text);
  border-radius: 8px;
  background-color: var(--popup-bg);
}

</style>
