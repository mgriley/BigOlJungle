<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, goToFilesEditor } from '../State.js'
import { addElem, removeElem } from '../Utils.js'
import FilesPageItem from '../FilesPageItem.vue'

onMounted(() => {
})

onUnmounted(() => {
})

</script>

<template>  
  <div>
    <button v-if="gApp.site.isEditing" class="EditButton SmallButton MarginBotS"
      @click="goToFilesEditor()">
      Edit Files
    </button>
    <div v-if="Object.keys(gApp.site.resolvedFilesDict).length > 0">
      <FilesPageItem :item="gApp.site.resolvedFilesDict" :isRoot="true" />
    </div>
    <div v-else>
      <p>There are currently no files.</p>
    </div>
  </div>
</template>

<style scoped>
</style>

