<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { gApp } from './State.js'
import BasicModal from 'Shared/BasicModal.vue'
import FilePicker from './FilePicker.vue'

// See: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#using_hidden_file_input_elements_using_the_click_method

const props = defineProps({
  modelValue: [String, Object]
})
const emit = defineEmits(['update:modelValue', 'onCancel', 'onDone'])

let initialValue = props.modelValue;
let modal = ref(null);
let files = ref(null);
let changeEvtHandle = null;
let uploadingText = ref("");

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

//let fileInputRef = ref(null);

/*
function startPicking() {
  fileInputRef.value.click();
}
*/

function showModal() {
  initialValue = value.value;
  modal.value.showModal();
}

async function updateFileOptions() {
  console.log("ImageChooser updating options");
  let children = await gApp.site.siteDir.getSortedChildren();
  let newFiles = [];
  for (const file of children) {
    let url = await file.createObjectUrl();
    newFiles.push({name: file.getName(), url: url})
  }
  files.value = newFiles;
}

function handleCancel() {
  console.log("Setting to initialValue: " + initialValue);
  value.value = initialValue;
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
  // The fileStorage change listener should handle updating files
  console.log("Done uploading");
}

onMounted(() => {
  changeEvtHandle = gApp.fileStorage.onChangeEvt.addListener(updateFileOptions);
  updateFileOptions();
})

onUnmounted(() => {
  gApp.fileStorage.onChangeEvt.removeListener(changeEvtHandle);
});

defineExpose({
  showModal
})

</script>

<template>
  <BasicModal ref="modal" title="Choose an image:" @onCancel="handleCancel" class="Modal">
    <div class="MarginBotS">
      <p>Current file: {{ value }}</p>
      <p>Uploaded images:</p>
      <div class="ImgGrid MarginBotS">
        <div v-for="file of files" class="Preview" @click="value = file.name"
          :class="{IsChosen: file.name == modelValue}">
          <img class="PreviewImg" :src="file.url" alt="Preview of {{ file.name }} image." />
          <!-- <p>{{ file.name }}</p> -->
        </div>
      </div>
      <FilePicker name="Upload images" @onPicked="onFilesPicked" />
    </div>
    <div class="MarginBotS">
      <p>Free stock images (from Unsplash):</p>
      <div>
        <p>Todo</p>
      </div>
    </div>

    <p>Note: you can find more free stock images on Unsplash.</p>
  </BasicModal>
</template>

<style scoped>
.ImgGrid {
  display: grid;
  grid-template-columns: repeat(4, min-content);
  gap: var(--space-xs);
}

.Preview {
  background-color: var(--medium-color);
}

.Preview:hover {
  cursor: pointer;
  outline: 1px solid yellow;
}

.Preview.IsChosen {
  outline: 1px solid yellow;
}

.PreviewImg {
  max-width: 125px;
  max-height: 125px;
  object-fit: contain;
  object-position: top left;
  margin: auto;
}

.Modal {
  width: 800px;
}
</style>
