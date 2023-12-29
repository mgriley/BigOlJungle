<script setup>
import { ref, shallowRef, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import ShortcutBtns from './ShortcutBtns.vue'

import SettingsEditor from './SettingsEditor.vue'
import PropEditor from './PropEditor.vue'
import NodeTreeView from './NodeTreeView.vue'
import FileEditor from './FileEditor.vue'

let sidebarTabs = [
  {name: 'Settings', comp: SettingsEditor},
  {name: 'Nodes', comp: NodeTreeView},
  {name: 'PropEditor', comp: PropEditor},
  {name: 'Files', comp: FileEditor},
];

let sidebarTab = shallowRef(sidebarTabs[0].comp);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

</script>

<template>  
  <NavBar v-if="isEditing" />
  <ShortcutBtns />

  <div class="Toplevel" :class="{IsEditing: isEditing}">
    <div class="MainArea">
      <router-view></router-view>
    </div>
    <div v-if="isEditing" class="Sidebar">
      <div class="SidebarButtons Flex">
        <p v-for="tab in sidebarTabs" @click="sidebarTab = tab.comp"
          class="TabButton TextButton" :class="{IsActive: sidebarTab == tab.comp}">{{tab.name}}</p>
      </div>
      <div>
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
  grid-template-columns: 1fr 400px;
}

.Sidebar {
  background-color: var(--main-bg);
  z-index: 1000;
  border-left: 1px solid var(--light-color);
  padding: var(--space-s) var(--space-m);
}

.SidebarButtons {
  gap: var(--space-s);
  row-gap: 0;
  border-bottom: 1px solid var(--main-text);
  margin-bottom: var(--space-m);
}

.TabButton {
  margin-top: 0;
  margin-bottom: 0;
}

.TabButton.IsActive {
  color: var(--main-text);
  color: orange;
}
</style>
