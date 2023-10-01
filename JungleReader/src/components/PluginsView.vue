<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FetchMethod, FeedGroup, Feed } from '../State.js'
import { CustomPlugin, CustomPluginType } from '../PluginLib.js'
import PluginEditor from './PluginEditor.vue'
import ScriptEditor from './ScriptEditor.vue'
import QuickParseEditor from './QuickParseEditor.vue'
import BasicSelector from './BasicSelector.vue'
import MoreInfoText from './MoreInfoText.vue'

</script>

<template>
  <button class="SaveButton" @click="gApp.saveAll()">Save Changes</button>
  <div class="TextPluginEditor" v-if="gApp.getPluginToEdit()">
    <button class="DoneButton BackButton" @click="gApp.setPluginToEdit(null)">Back to Plugins</button>  
    <h1 class="PageHeader PluginName">{{ gApp.getPluginToEdit().feedType }}</h1>
    <div v-if="gApp.getPluginToEdit().pluginType == CustomPluginType.Text">
      <ScriptEditor class="ScriptEditor" v-model="gApp.getPluginToEdit().pluginText" />
    </div>
    <div v-else-if="gApp.getPluginToEdit().pluginType == CustomPluginType.QuickParse">
      <QuickParseEditor :plugin="gApp.getPluginToEdit()" />
    </div>
  </div>
  <div v-else>
    <h1 class="PageHeader">Plugins</h1>
    <div class="Desc">
      <p class="MarginBotS">
        Plugins allow JungleReader to support sites that aren't supported out-of-the-box.
        The plugin system is designed to help devs add support for almost any site or data source.
      </p>
      <MoreInfoText text="More info on plugins">
        There are a couple different
        options. You can write a custom script, use the QuickParser gui,
        or provide a link to someone else's plugin.
        <p class="Italic">
          (Note that you cannot have multiple plugins with the same name.)
        </p>
      </MoreInfoText>
    </div>
    <PluginEditor />
  </div>
</template>

<style scoped>
.SaveButton {
  float: right;
}

.TextPluginEditor {
  margin-bottom: 8px;
}

.PluginName {
}

.ScriptEditor {
  margin-bottom: 40px;
}

.DoneButton {
  margin-right: var(--space-xs);
  float: right;
}

.Desc {
  margin-bottom: 40px;
}

.PluginHelp {
  margin-top: var(--space-xs);
  margin-bottom: 40px;
}

</style>
