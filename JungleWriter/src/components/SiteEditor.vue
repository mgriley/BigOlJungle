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

const isMobile = ref(false)

function checkIfMobile() {
  // Consider mobile if screen width is less than 768px
  isMobile.value = window.innerWidth < 768
}

function onResize() {
  checkIfMobile()
}

onMounted(() => {
  checkIfMobile()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

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
  <div v-if="isMobile" class="MobileMessage">
    <div class="HeroImage">
      <img src="../assets/robin-teng-unsplash.jpg" alt="Bat photo by Robin Teng on Unsplash" />
    </div>
    <div class="MobileMessageContent">
      <h2>Small Device Detected 👀</h2>
      <p>This screen is too small to display our glorious website editor, sorry!</p>
      <p>Please come back on desktop to create a site.</p>
    </div>
    <div class="ImageAttribution">
      Photo by Robin Teng on Unsplash
    </div>
  </div>

  <div v-else>
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

.MobileMessage {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: blue;
}

.HeroImage {
  width: 100%;
  height: 40vh;
  overflow: hidden;
}

.HeroImage img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.MobileMessageContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
  padding: var(--space-l);
}

.MobileMessageContent h2 {
  color: var(--text-color);
  margin-bottom: var(--space-m);
  font-size: var(--text-size-xl);
}

.MobileMessageContent p {
  color: var(--text-color-secondary);
  margin-bottom: var(--space-s);
  font-size: var(--text-size-base);
  line-height: 1.5;
}

.ImageAttribution {
  position: absolute;
  bottom: var(--space-s);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--text-size-xs);
  color: var(--text-color-tertiary);
  opacity: 0.6;
  text-align: center;
}

</style>
