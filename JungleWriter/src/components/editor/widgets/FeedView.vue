<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post, goToFeedEditor } from '../State.js'
import { addElem, removeElem } from '../Utils.js'

let feed = gApp.site.postsFeed;

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
      @click="goToFeedEditor()">
      Edit Feed
    </button>
    <div v-if="feed.posts.length > 0" class="Post" v-for="post in feed.posts">
      <h4>{{post.dateString()}}</h4>
      <div v-if="post.renderedMarkdown" v-html="post.renderedMarkdown"></div>
      <div v-else>
        <p>This post is empty...</p>
      </div>
    </div>
    <div v-else>
      <p>The feed is currently empty.</p>
    </div>
  </div>
</template>

<style scoped>
.EditButton {
}
</style>

