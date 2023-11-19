<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps({
  item: Object,
  isRoot: {
    type: Boolean,
    default: false
  }
})

// Note: this is annoying to get right, don't bother. User can upload a zip if they want.
function downloadFolder() {
  // Download the full folder as a zip
}

</script>

<template>
  <div class="FilesPageItem">
    <div v-if="item.children == undefined || item.children.length == 0">
      <a :href="item.fileUrl" download><p class="FileName">{{ item.name }}</p></a>
    </div>
    <div v-else>
      <div v-if="!isRoot" class="FolderBar Flex">
        <div class="FolderName MockButton" @click="item.isOpen = !item.isOpen">{{ item.name }}{{ item.isOpen ? "" : "..." }}</div>
        <!-- <button class="SmallButton" @click="downloadFolder">(Download)</button> -->
      </div>
      <div v-if="item.isOpen" class="ChildItems" :class="{IndentedChilds: !isRoot}">
        <FilesPageItem v-for="child in item.children" :item="child" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.ChildItems {
}

.IndentedChilds {
  margin-left: 16px;
}

.FolderBar {
  gap: 24px;
  align-items: baseline;
}

.FolderName {
  font-size: 24px;
  font-weight: var(--bold-weight);
  margin-bottom: 4px;
}

.FileName {
  font-size: 24px;
}
</style>
