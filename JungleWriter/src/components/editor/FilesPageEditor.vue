<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem, removeElem } from './Utils.js'
import FileEditor from './FileEditor.vue'
import FilesPageItem from './FilesPageItem.vue'

let feed = gApp.site.postsFeed;

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

let isEditingConfig = ref(false);
let filesDict = ref({});

let debugFilesDict = {
  name: "Root",
  isOpen: true,
  children: [
    {
      name: "A",
      isOpen: false,
      children: [],
    },
    {
      name: "B",
      isOpen: false,
      children: [],
    },
    {
      name: "SubFolder",
      isOpen: false,
      children: [
        {
          name: "C",
          isOpen: false,
          children: [],
        }
      ]
    }
  ]
};

function getChild(dict, childName) {
  for (const child of dict.children) {
    if (child.name == childName) {
      return child;
    }
  }
  return null;
}

function addEntryToDict(filesDict, destPath, fileUrl, fullPath) {
  // console.log(`Adding entry ${destPath}, ${fileUrl}`);
  let pathParts = destPath.split("/");
  console.assert(pathParts.length !== 0);
  let nextPart = pathParts[0];
  if (pathParts.length === 1) {
    if (getChild(filesDict, nextPart)) {
      throw new Error(`You have two files at the same path: ${fullPath}`);
    }
    let child = {
      name: nextPart,
      isOpen: false,
      fileUrl: fileUrl,
      children: [],
    };
    filesDict.children.push(child);
  } else {
    let child = getChild(filesDict, nextPart);
    if (!child) {
      child = {
        name: nextPart,
        isOpen: false,
        children: [],
      };
      filesDict.children.push(child);
    }
    if (child.fileUrl) {
      throw new Error("There is a path conflict with this path: " + fullPath);
    }
    addEntryToDict(child, pathParts.slice(1).join("/"), fileUrl, fullPath);
  }
}

async function updateFilesDict() {
  filesDict.value = {
    name: "Files",
    isOpen: true,
    children: [],
  };

  // TODO - convert the filesPageConfig to filesDict here
  let blobUrls = await gApp.site.getBlobUrlMap();
  let filesConfig = gApp.site.filesPageConfig;
  let fileLines = filesConfig.split("\n");
  for (const fileLine of fileLines) {
    if (!fileLine) {
      continue;
    }
    let parts = fileLine.split("=");
    parts = parts.map((part) => { return part.trim(); });
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      // TODO - show error popup
      throw new Error("Invalid file entry: " + fileLine);
    }
    let destPath = parts[0];
    let fileName = parts[1];
    if (blobUrls[fileName] === undefined) {
      throw new Error(`Unknown filename "${fileName}" in file entry "${fileLine}"`);
    }
    addEntryToDict(filesDict.value, destPath, blobUrls[fileName], destPath);
  }
}

async function onDoneEditing() {
  isEditingConfig.value = false;
  await updateFilesDict();
}

onMounted(() => {
  updateFilesDict();
})

onUnmounted(() => {
})

</script>

<template>  
  <FileEditor v-if="isEditing" />
  <div class="OuterDiv">
    <div class="Editor">
      <h1 class="Header">Files</h1>
      <div v-if="isEditingConfig">
        <div class="EditBar">
          <button class="SmallButton" @click="onDoneEditing">Done</button>
        </div>
        <textarea class="ConfigTextArea" v-model="gApp.site.filesPageConfig"></textarea>
      </div>
      <div v-else>
        <div class="EditBar">
          <button class="SmallButton" @click="isEditingConfig = true">Edit</button>
        </div>
        <FilesPageItem :item="filesDict" :isRoot="true" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.OuterDiv {
  width: 100%;
  height: 100vh;
  background-color: var(--dark-color);
}

.Editor {
  background-color: var(--darkest-color);
  max-width: 800px;
  margin: auto;
  padding: var(--space-m);
}

.Header {
  margin-bottom: var(--space-l);
}

.ConfigTextArea {
  display: block;
  width: 100%;
  height: 600px;
  resize: vertical;
}

.EditBar {
  margin-bottom: 16px;
}

</style>
