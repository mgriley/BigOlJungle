<script setup>
import { gApp } from './State.js'

function onDeploy() {
  console.log("Deploying!")
}

function onExportProjectFile() {
  if (gApp.site) {
    gApp.site.exportSite();
  } else {
    console.log("No site selected to export");
  }
}

function onGenerateStaticSite() {
  if (gApp.site) {
    gApp.site.generateStaticSite();
  } else {
    console.log("No site selected to generate static site");
  }
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

function goToHomeEditor() {
  console.log("Going to home");
  gApp.router.push({name: "home"});
}

function goToFeedEditor() {
  console.log("Going to feed");
  gApp.router.push({name: "feed"});
}

function goToBlogEditor() {
  console.log("Going to blog");
  gApp.router.push({name: "blog"});
}

function goToFilesEditor() {
  console.log("Going to files");
  gApp.router.push({name: "files"})
}

function goToGalleryEditor() {
  console.log("Going to gallery");
  gApp.router.push({name: "gallery"})
}

const kMenuItems = [
  {
    name: "Back to sites",
    action: goToSites
  },
  {
    name: "Save",
    action: onSaveFile,
  },
  /*
  {
    name: "Deploy",
    action: onDeploy
  },
  */
  {
    name: "Generate site",
    action: onGenerateStaticSite
  },
  /*
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
  */
  {
    name: "Export project file",
    action: onExportProjectFile
  },
];

</script>

<template>  
  <div class="NavBar">
    <div class="MenuIcon">
      <i class="bi bi-list"></i> Menu
    </div>
    <div class="InnerMenu">
      <div v-for="item in kMenuItems" :key="item.name" class="MenuItem">
        <a v-if="item.action" href="#" @click.prevent="item.action()" class="MenuLink">
          {{ item.name }}
        </a>
        <span v-else class="MenuLabel">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.NavBar {
  position: relative;
  display: inline-block;
}

.MenuIcon {
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-s);
  background-color: var(--main-bg);
  color: var(--main-text);
  cursor: pointer;
  font-size: var(--text-size-sm);
  transition: background-color 0.2s ease;
}

.MenuIcon:hover {
  background-color: var(--link-hover-bg);
}

.InnerMenu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background-color: var(--main-bg);
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: var(--space-xs) 0;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
}

.NavBar:hover .InnerMenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.MenuItem {
  padding: 0;
}

.MenuLink {
  display: block;
  padding: var(--space-xs) var(--space-s);
  color: var(--main-text);
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.MenuLink:hover {
  background-color: var(--link-hover-bg);
  color: var(--primary-color);
}

.MenuLabel {
  display: block;
  padding: var(--space-xs) var(--space-s);
  color: var(--secondary-text);
  font-weight: 500;
  cursor: default;
}

</style>

