<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, } from './State.js'
import FilePicker from './FilePicker.vue'

// Helperful guide:
// https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications

let fileRoot = gApp.fileStorage.root;
let selectedFile = ref(null);
let thumbnailSrc = ref("");

let uploadingText = ref("");

let fileTree = ref(null);

function dumpFileTree() {
  // TODO
  console.log(fileTree.value);
}

async function reloadFiles() {
  console.log("FileEditor reloading site files...")
  let siteDir = gApp.site.getSiteDir();
  fileTree.value = await siteDir.getSortedChildren();
  console.log("Done reloading");
  dumpFileTree();
}

function getSiteFiles() {
  if (!fileTree.value) {
    return [];
  }
  // Filter out data.json file
  return fileTree.value.filter(file => file.getName() !== 'data.json');
}

async function onFilesPicked(files) {
  console.log("Some files picked: ", files);
  let siteDir = gApp.site.getSiteDir();
  console.log(`Writing ${files.length} files...`);
  uploadingText.value = "";
  for (let i = 0; i < files.length; ++i) {
    let file = files[i];
    let fileName = file.name.split("/").pop();
    let validFileName = await siteDir.genValidFileName(fileName);
    uploadingText.value = `Saving file ${i + 1}/${files.length}: ${file.name} as ${validFileName}`
    let fileObj = await siteDir.createFile(validFileName);
    await fileObj.writeContents(file);
  }
  uploadingText.value = "";
  // TODO - show "Done upload" toast
  console.log("Done uploading");
  // TODO - subscribe to the file system changes from the root node onMount
  await reloadFiles();
}

async function selectFile(file) {
  console.log("Selecting file: " + file.getName());
  selectedFile.value = file;
  thumbnailSrc.value = await file.createObjectUrl();
}

function isSelected(file) {
  return selectedFile.value == file;
}

async function deleteSelectedFile() {
  if (!selectedFile.value) {
    return;
  }
  console.log("Deleting file: " + selectedFile.value.getName());
  await selectedFile.value.remove();
  await reloadFiles();
}

async function downloadSelectedFile() {
    
}

onMounted(async () => {
  await reloadFiles();  
});

</script>

<template>
  <div>
    <div class="Flex BtnRow">
      <FilePicker name="Upload" @onPicked="onFilesPicked" />
      <button class="TertiaryButton" @click="reloadFiles" title="Refresh">
        <i class="bi bi-arrow-clockwise"></i>
      </button>
      <template v-if="selectedFile">
        <!--
        <button class="TertiaryButton DownloadBtn" @click="downloadSelectedFile" title="Download File">
          <i class="bi bi-download"></i>
        </button>
        -->
        <button class="TertiaryButton DeleteBtn" @click="deleteSelectedFile" title="Delete File">
          <i class="bi bi-trash"></i>
        </button>
      </template>
    </div>
    <!-- <p v-if="uploadingText">{{ uploadingText }}</p> -->
    <div v-if="gApp.site.siteDir" class="FileView">
      <div v-for="item in getSiteFiles()" class="FileItem">
        <div :class="{IsSelected: isSelected(item)}" class="MockButton" @click="selectFile(item)">{{ item.getName() }}</div>
      </div>
      <div v-if="thumbnailSrc !== ''" class="Preview">
        <img class="PreviewImg" :src="thumbnailSrc" alt="Image preview" />
      </div>
    </div>
    <div v-else>
      Files loading...
    </div>
  </div>
</template>

<style scoped>
.BtnRow {
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--secondary-text);
}

.DownloadBtn {
}

.DeleteBtn {
  margin-left: auto;
}

.FileView {
  margin-top: var(--space-s);
  font-family: monospace;
}

.FileItem .IsSelected {
  background-color: lightblue;
}

.Preview {
  margin-top: var(--space-l);
}

.PreviewImg {
  width: 200px;
  height: 200px;
  object-fit: contain;
  object-position: top left;
}

</style>

