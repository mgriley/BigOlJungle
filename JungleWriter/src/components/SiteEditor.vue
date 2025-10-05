<script setup>
import { ref, shallowRef, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import TopMenu from './TopMenu.vue'
import DropdownSelector from './DropdownSelector.vue'

import SettingsEditor from './SettingsEditor.vue'
import PropEditor from './PropEditor.vue'
import NodeTreeView from './NodeTreeView.vue'
import FileEditor from './FileEditor.vue'

let sidebarTabs = [
  {name: 'Editor', icon: 'bi bi-sliders', comp: PropEditor},
  {name: 'Global settings', icon: 'bi bi-sliders', comp: SettingsEditor},
  // {name: 'Nodes', comp: NodeTreeView},
  {name: 'Upload files', icon: 'bi bi-folder', comp: FileEditor},
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
  <TopMenu v-if="isEditing" />

  <div class="Toplevel" :class="{IsEditing: isEditing}">
    <div v-if="isEditing" class="Sidebar SidebarLeft">
      <NavBar class="mb-s" />
      <div class="SidebarContent">
        <NodeTreeView />
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
      <div class="SidebarContent">
        <component :is="sidebarTab"></component>
      </div>
    </div>
  </div>
</template>

<style scoped>
.Toplevel {
  display: grid;
  grid-template-columns: 1fr;
  height: 100vh;
}

.Toplevel.IsEditing {
  grid-template-columns: 300px 1fr 300px;
}

.Sidebar {
  background-color: var(--main-bg);
  z-index: 1000;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  /*padding: var(--space-s) var(--space-m);*/

  display: flex;
  flex-direction: column;
}

.SidebarContent {
  flex: 1;
  overflow: auto;
}

.SidebarLeft {
  border-left: 1px solid var(--light-color);
  padding: var(--space-s) var(--space-s);
}

.SidebarRight {
  border-left: 1px solid var(--light-color);
  padding: var(--space-s) var(--space-s);
}

.MainArea {
  /* Do not allow the editor section to extend past the viewport height */
  height: 100vh;
  overflow: auto;
}

.TabSelector {
  margin-bottom: var(--space-m);
}

</style>
