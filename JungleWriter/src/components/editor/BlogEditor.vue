<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem, removeElem } from './Utils.js'

let feed = gApp.site.postsFeed;
let selectedPost = ref(null);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

onMounted(() => {
})

onUnmounted(() => {
})

</script>

<template>  
  <div class="OuterBlog">
    <div class="Blog">
      <h1 class="Header">Blog</h1>
      <div class="ButtonRow">
        <button class="SmallButton" @click="newPost">New Post</button>
      </div>
      <!--
      <div class="Post" v-for="post in feed.posts">
      </div>
      !-->
    </div>
  </div>
</template>

<style scoped>
.OuterBlog {
  width: 100%;
  height: 100vh;
  background-color: var(--dark-color);
}

.Blog {
  background-color: var(--darkest-color);
  max-width: 800px;
  margin: auto;
  padding: var(--space-m);
}

.Header {
  margin-bottom: var(--space-l);
}

.ButtonRow {
  margin-bottom: var(--space-m);
}

</style>
