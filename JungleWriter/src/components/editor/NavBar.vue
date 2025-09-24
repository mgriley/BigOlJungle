<script setup>
import { 
  gApp,
  goToHomeEditor, 
  goToFeedEditor, 
  goToBlogEditor, 
  goToFilesEditor, 
  goToGalleryEditor 
} from './State.js'

function onDeploy() {
  console.log("Deploying!")
}

function onNewFile() {
}

function onOpenFile() {
}

function onSaveFile() {
}

function goToSites() {
  gApp.deselectSite();
}

const kMenuItems = [
  {
    name: "Main Menu",
    action: goToSites
  },
  {
    name: "File",
    items: [
      {
        name: "New",
        action: onNewFile,
      },
      {
        name: "Open",
        action: onOpenFile,
      },
      {
        name: "Save",
        action: onSaveFile,
      }
    ]
  },
  {
    name: "Insert"
  },
  {
    name: "Deploy",
    action: onDeploy
  },
  {
    name: "Settings"
  },
  {
    name: "HomeEditor",
    action: goToHomeEditor,
  },
  {
    name: "FeedEditor",
    action: goToFeedEditor,
  },
  {
    name: "BlogEditor",
    action: goToBlogEditor,
  },
];

</script>

<template>  
  <div class="NavBar">
    <div class="MenuIcon">
      Menu
    </div>
    <div class="InnerMenu">
      <div v-for="item in kMenuItems" class="MenuItem">
        <div>
          <a v-if="item.action" href="#" @click="item.action()">{{ item.name }}</a>
          <a href="#" v-else>{{ item.name }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.NavBar {
  position: absolute;
  display: flex;
  top: 16px;
  left: 16px;
  display: inline-block;
  z-index: 2000;
}

.MenuIcon {
  border: 1px solid var(--main-text);
  /* border-radius: var(--border-radius-med); */
  display: inline-block;
  padding: 6px;
  background-color: var(--dark-color);
  color: var(--main-text);
  cursor: pointer;
  /* font-size: var(--smaller-size); */
}

.NavBar .InnerMenu {
  display: none;
  background-color: blue;
  padding: var(--space-xs) var(--space-xl) var(--space-s) var(--space-s);
}

.NavBar:hover .InnerMenu {
  display: block;
}

.MenuItem {
}

</style>

