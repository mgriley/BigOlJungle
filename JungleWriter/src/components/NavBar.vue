<script setup>
import { gApp } from './State.js'
import DropdownSelector from './DropdownSelector.vue'

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

function goToSites() {
  gApp.closeSiteEditor();
}

function goToSceneEditor() {
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
    icon: "bi bi-arrow-left",
    action: goToSites
  },
  /*
  {
    name: "Deploy",
    action: onDeploy
  },
  */
  {
    name: "Generate site",
    icon: "bi bi-globe",
    action: onGenerateStaticSite
  },
  /*
  {
    name: "SceneEditor",
    action: goToSceneEditor,
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
    name: "Export project",
    icon: "bi bi-download",
    action: onExportProjectFile
  },
];

function handleMenuSelect(item) {
  if (item.action) {
    item.action();
  }
}

</script>

<template>  
  <div class="NavBar">
    <DropdownSelector 
      :items="kMenuItems"
      placeholder="Menu"
      icon="bi-list"
      @select="handleMenuSelect"
    />
  </div>
</template>

<style scoped>
.NavBar {
  display: inline-block;
}
</style>

