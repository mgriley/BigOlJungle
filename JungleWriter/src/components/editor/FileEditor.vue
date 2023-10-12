<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, Node } from './State.js'
import EditorPane from './EditorPane.vue'
import FilePicker from './FilePicker.vue'

// Helperful guide:
// https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications

let fileStorage = gApp.fileStorage;
let selectedFile = ref(null);

let uploadingText = ref("");

async function reloadFiles() {
  console.log("Reloading files...")
  await fileStorage.reload();
  console.log("Done reloading");
  fileStorage.dump();
}

async function onFilesPicked(files) {
  console.log("Some files picked: ", files);
  let siteDir = gApp.site.getSiteDir();
  if (!siteDir) {
    console.log("siteDir not ready yet.");
    return;
  }
  console.log("Writing files...");
  uploadingText.value = "";
  for (let i = 0; i < files.length; ++i) {
    let file = files[i];
    let fileName = file.name.split("/").pop();
    let validFileName = siteDir.genValidFileName(fileName);
    uploadingText.value = `Saving file ${i + 1}/${files.length}: ${file.name} as ${validFileName}`
    let fileObj = await siteDir.createFile(validFileName);
    await fileObj.writeContents(file);
  }
  uploadingText.value = "";
  // TODO - show "Done upload" toast
  console.log("Done uploading");
  await reloadFiles();
}

function selectFile(file) {
  console.log("Selecting file: " + file.getName());
  selectedFile.value = file;
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
  <EditorPane paneTitle="Files" paneId="Files" :startX="600" :startY="100">
    <div class="Flex BtnRow">
      <button class="TertiaryButton" @click="reloadFiles">Reload</button>
      <FilePicker name="Upload" @onPicked="onFilesPicked" />
      <template v-if="selectedFile">
        <button class="TertiaryButton DeleteBtn" @click="deleteSelectedFile">Delete File</button>
        <button class="TertiaryButton DownloadBtn" @click="downloadSelectedFile">Download File</button>
      </template>
    </div>
    <!-- <p v-if="uploadingText">{{ uploadingText }}</p> -->
    <div v-if="gApp.site.siteDir" class="FileView">
      <div v-for="item in gApp.site.siteDir.getSortedChildren()" class="FileItem">
        <div :class="{IsSelected: isSelected(item)}" class="MockButton" @click="selectFile(item)">{{ item.getName() }}</div>
      </div>
    </div>
    <div v-else>
      Files loading...
    </div>
  </EditorPane>
</template>

<style scoped>
.BtnRow {
  gap: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--secondary-text);
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

</style>

