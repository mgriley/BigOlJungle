<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'
import { removeElem } from '../Utils.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import OptionsInput from './OptionsInput.vue'
import BasicSelector from './BasicSelector.vue'
import ToggleSwitch from './ToggleSwitch.vue'
import MoreInfoText from './MoreInfoText.vue'

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

function requiresWhitelist(pluginType) {
  return pluginType == CustomPluginType.Text ||
    pluginType == CustomPluginType.URL;
}

</script>

<template>
  <div class="PluginEditor">
    <div class="PluginList">
      <div v-for="plugin in gApp.customPlugins" class="Plugin">
        <div class="NameBox Flex">
          <h4 class="NameHeader Block MockButton PlainHeader" :class="{Disabled: !plugin.isEnabled}" @click="plugin.expandedInUi = !plugin.expandedInUi">
          {{ plugin.feedType ? plugin.feedType : "NoName" }}{{ plugin.expandedInUi ? "" : "..." }}
          </h4>
          <ToggleSwitch label="Enabled" v-model="plugin.isEnabled" />
        </div>
        <div v-if="plugin.expandedInUi" class="PluginDetails">
          <div class="NameTypeBox Flex FieldEntry">
            <div>
              <div class="FormFieldName">Name</div>
              <input v-model="plugin.feedType" class="BasicTextInput Block NameInput" type="text">
            </div>
            <div>
              <div class="FormFieldName">Type</div>
              <BasicSelector :value="plugin.pluginType" :options="supportedPluginTypes" @change="(newVal) => onChangePluginType(plugin, newVal)" />
            </div>
          </div>
          <div class="EditorField">
            <template v-if="plugin.pluginType == CustomPluginType.URL">
              <div class="FormFieldNameWithInfo UrlPluginStart">Url</div>
              <div class="FormFieldInfo">Ex: www.myplugins.com/SomePlugin.json</div>
              <input v-model="plugin.remoteParser.pluginUrl" class="BasicTextInput Block UrlInput" type="text">
            </template>
            <template v-else-if="plugin.pluginType == CustomPluginType.Text">
              <button class="EditorBtn" @click="openEditor(plugin)">Open Editor</button>
            </template>
            <template v-else-if="plugin.pluginType == CustomPluginType.QuickParse">
              <button class="EditorBtn" @click="openEditor(plugin)">Open Editor</button>
            </template>
          </div>
          <MoreInfoText class="PluginSettings" text="Settings" :showEllipse="true">
            <div class="Options FieldEntry">
              <div class="FormFieldName CustomOptionsField">Custom Options</div>
              <OptionsInput :options="plugin.options" />
            </div>
            <div v-if="requiresWhitelist(plugin.pluginType)" class="Options FieldEntry">
              <div class="FormFieldName CustomOptionsField">Domain Whitelist</div>
              <OptionsInput :options="plugin.domainWhitelist" :hasKeys="false" />
            </div>
            <button class="SmallButton DeleteButton" @click="removePlugin(plugin)">Delete Plugin</button>
          </MoreInfoText>
        </div>
      </div>
      <button class="AddPluginBtn" @click="addPlugin">Add Plugin</button>
    </div>
  </div>
</template>

<style scoped>
.PluginList {
  margin-top: var(--space-s);
}

.Plugin {
  margin-bottom: var(--space-m);
}

.AddPluginBtn {
  margin-top: var(--space-s);
}

.NameBox {
  align-items: baseline;  
}

.NameHeader {
  margin-right: var(--space-s);
}

.Disabled {
  color: var(--mute-text);
}

.NameInput {
  margin-right: var(--space-m);
}

.UrlInput {
  display: flex;
  width: 30ch;
  max-width: 30ch;
  /* min-width: 10ch; */
}

.FieldEntry {
}

.EditorField {
  margin-bottom: var(--space-m);
}

.EditorField .UrlPluginStart {
  margin-top: var(--space-s);
}

.EditorBtn {
  margin-top: 16px;
}

.Options {
  margin-bottom: var(--space-s);
}

.PluginDetails {
  padding: var(--space-s);
  border-radius: var(--border-radius-med);
  border: 1px solid var(--light-color);
  background-color: var(--popup-bg);
}

.DeleteButton {
  margin-top: var(--space-xs);
}

</style>
