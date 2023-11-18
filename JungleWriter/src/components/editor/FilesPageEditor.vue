<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem, removeElem } from './Utils.js'
import FileEditor from './FileEditor.vue'

let feed = gApp.site.postsFeed;

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

let isEditingConfig = ref(false);

function doneEditing(post) {
  selectedPost.value = null;
  post.renderMarkdown();
}

onMounted(() => {
  // TODO
  /*
  for (const post of feed.posts) {
    post.renderMarkdown();
  }
  */
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
        <button @click="isEditingConfig = false">Done</button>
        <textarea class="ConfigTextArea" v-model="gApp.site.filesPageConfig"></textarea>
      </div>
      <div v-else>
        <p>{{ gApp.site.filesPageConfig }}</p>
        <button @click="isEditingConfig = true">Edit</button>
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

</style>
