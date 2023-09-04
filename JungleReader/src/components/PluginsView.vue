<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import PluginEditor from './PluginEditor.vue'
import CodeEditor from './CodeEditor.vue'
import QuickParseEditor from './QuickParseEditor.vue'
import BasicSelector from './BasicSelector.vue'
import HelpButton from './HelpButton.vue'
import { kPluginHelp } from '../HelpText.js'

</script>

<template>
  <button class="SaveButton" @click="gApp.saveAll()">Save Changes</button>
  <div class="TextPluginEditor" v-if="gApp.getPluginToEdit()">
    <button class="DoneButton" @click="gApp.setPluginToEdit(null)">Back to Plugins</button>  
    <h1 class="PluginName">{{ gApp.getPluginToEdit().feedType }}</h1>
    <div v-if="gApp.getPluginToEdit().pluginType == CustomPluginType.Text">
      <CodeEditor class="CodeEditor" v-model="gApp.getPluginToEdit().pluginText" />
    </div>
    <div v-else-if="gApp.getPluginToEdit().pluginType == CustomPluginType.QuickParse">
      <QuickParseEditor :plugin="gApp.getPluginToEdit()" />
    </div>
  </div>
  <div v-else>
    <h1 class="PageHeader">Plugins</h1>
    <div class="Desc">
      <p>
        Plugins allow JungleReader to support sites that aren't supported out-of-the-box.
        The plugin system is meant to help devs create feeds for almost any site or data source. There are a couple different
        options. You can write a custom script, use the QuickParser gui,
        or provide a link to someone else's plugin.
      </p>
      <p class="Italic">
        (Note that you cannot have multiple plugins with the same name.)
      </p>
      <div class="PluginHelp">
        <HelpButton title="Plugin Help" :text="kPluginHelp" />
      </div>
    </div>
    <PluginEditor />
  </div>
</template>

<style scoped>
.SaveButton {
  float: right;
}

.TextPluginEditor .PluginName {
  margin-bottom: 10px;
}

.CodeEditor {
  margin-bottom: 40px;
}

.DoneButton {
  margin-bottom: 40px;
  margin-right: 4px;
  float: right;
}

.Desc {
  margin-bottom: 40px;
}

.PluginHelp {
  margin-top: 20px;
  margin-bottom: 40px;
}

</style>
