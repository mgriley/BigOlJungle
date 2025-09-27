<script setup>
import { ref, shallowRef, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import ShortcutBtns from './ShortcutBtns.vue'
import DropdownSelector from './DropdownSelector.vue'

import SettingsEditor from './SettingsEditor.vue'
import PropEditor from './PropEditor.vue'
import NodeTreeView from './NodeTreeView.vue'
import FileEditor from './FileEditor.vue'

let sidebarTabs = [
  {name: 'Editor', icon: 'bi bi-sliders', comp: PropEditor},
  {name: 'Settings', icon: 'bi bi-gear', comp: SettingsEditor},
  // {name: 'Nodes', comp: NodeTreeView},
  {name: 'Files', icon: 'bi bi-folder', comp: FileEditor},
];

let sidebarTab = shallowRef(sidebarTabs[0].comp);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

let currentTab = computed(() => {
  return sidebarTabs.find(tab => tab.comp === sidebarTab.value) || null;
});

function selectTab(tab) {
  sidebarTab.value = tab.comp;
}

</script>

<template>  
  <ShortcutBtns />

  <div class="Toplevel" :class="{IsEditing: isEditing}">
    <div v-if="isEditing" class="Sidebar SidebarLeft">
      <NavBar class="mb-s" />
      <div class="EditorPane">
        <component :is="NodeTreeView"></component>
      </div>
    </div>
    <div class="MainArea">
      <router-view></router-view>
    </div>
    <div v-if="isEditing" class="Sidebar SidebarRight">
      <div class="TabSelector">
        <DropdownSelector 
          :items="sidebarTabs"
          :currentItem="currentTab"
          @select="selectTab"
        />
      </div>
      <div class="EditorPane">
        <component :is="sidebarTab"></component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Toplevel {
  display: grid;
  grid-template-columns: 1fr;
}

.Toplevel.IsEditing {
  grid-template-columns: 300px 1fr 300px;
}

.Sidebar {
  background-color: var(--main-bg);
  z-index: 1000;
  /*padding: var(--space-s) var(--space-m);*/

  display: flex;
  flex-direction: column;
}

.SidebarLeft {
  border-left: 1px solid var(--light-color);
  padding: var(--space-s) var(--space-s);
}

.SidebarRight {
  border-left: 1px solid var(--light-color);
  padding: var(--space-s) var(--space-s);
}

.TabSelector {
  margin-bottom: var(--space-m);
}

.EditorPane {
  overflow-y: auto;
  scrollbar-width: thin;
  height: 100%;
  /*padding-right: 16px;*/
}

</style>
