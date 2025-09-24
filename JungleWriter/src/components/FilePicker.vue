<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

// See: https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications#using_hidden_file_input_elements_using_the_click_method

const props = defineProps({
  'name': {
    type: String
  }
})

const emit = defineEmits(['onPicked'])

let fileInputRef = ref(null);

function startPicking() {
  fileInputRef.value.click();
}

function onChange() {
  console.log("Files picked!");
  if (fileInputRef.value.files.length > 0) {
    emit('onPicked', fileInputRef.value.files);
  } else {
    console.log("No files picked");
  }
}

onMounted(() => {
})

</script>

<template>
  <input ref="fileInputRef" type="file" style="display:none" multiple @change="onChange"/>
  <button class="TertiaryButton" @click="startPicking">{{ name }}</button>
</template>

<style scoped>
</style>
