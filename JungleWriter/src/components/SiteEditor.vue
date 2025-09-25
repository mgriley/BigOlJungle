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
  {name: 'PropEditor', comp: PropEditor},
  {name: 'Settings', comp: SettingsEditor},
  // {name: 'Nodes', comp: NodeTreeView},
  {name: 'Files', comp: FileEditor},
];

let sidebarTab = shallowRef(sidebarTabs[0].comp);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

let currentTabName = computed(() => {
  return sidebarTabs.find(tab => tab.comp === sidebarTab.value)?.name || 'Unknown';
});

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
        <div class="TabDropdown">
          <div class="TabDropdownButton">
            <span>{{ currentTabName }}</span>
            <i class="bi bi-chevron-down"></i>
          </div>
          <div class="TabDropdownMenu">
            <div v-for="tab in sidebarTabs" :key="tab.name"
              @click="sidebarTab = tab.comp"
              class="TabDropdownItem"
              :class="{IsActive: sidebarTab == tab.comp}">
              {{ tab.name }}
            </div>
          </div>
        </div>
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
  grid-template-columns: 350px 1fr 350px;
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
  border-bottom: 1px solid var(--light-color);
  padding-bottom: var(--space-s);
}

.TabDropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.TabDropdownButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-s);
  background-color: var(--main-bg);
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--text-size-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.TabDropdownButton:hover {
  background-color: var(--link-hover-bg);
  border-color: var(--primary-color);
}

.TabDropdownMenu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--main-bg);
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
}

.TabDropdown:hover .TabDropdownMenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.TabDropdownItem {
  padding: var(--space-xs) var(--space-s);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: var(--text-size-sm);
}

.TabDropdownItem:hover {
  background-color: var(--link-hover-bg);
}

.TabDropdownItem.IsActive {
  background-color: var(--primary-color);
  color: white;
}

.TabDropdownItem.IsActive:hover {
  background-color: var(--primary-color);
}

.EditorPane {
  overflow-y: auto;
  scrollbar-width: thin;
  height: 100%;
  /*padding-right: 16px;*/
}

</style>
