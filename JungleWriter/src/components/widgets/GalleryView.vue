<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, goToGalleryEditor } from '../State.js'
import { addElem, removeElem } from '../Utils.js'

let feed = gApp.site.galleryFeed;

onMounted(() => {
  // Re-render all posts so that imgs show up properly
  for (const post of feed.posts) {
    post.renderMarkdown();
  }
})

onUnmounted(() => {
})

</script>

<template>  
  <div>
    <button v-if="gApp.site.isEditing" class="EditButton SmallButton MarginBotS"
      @click="goToGalleryEditor()">
      Edit Gallery
    </button>
    <div v-if="feed.posts.length > 0" class="Post" v-for="post in feed.posts">
      <p>{{post.title || 'Untitled'}} - {{post.dateString()}}</p>
    </div>
    <div v-else>
      <p>The gallery is empty.</p>
    </div>
  </div>
</template>

<style scoped>
</style>

