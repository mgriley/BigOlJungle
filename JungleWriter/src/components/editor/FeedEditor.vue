<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem } from './Utils.js'

let feed = gApp.site.postsFeed;
let selectedPost = ref(null);

function newPost() {
  let post = new Post();
  post.body = "Your text goes here"
  addElem(feed.posts, post, 0);
}

function editPost(post) {
  if (selectedPost.value) {
    doneEditing(selectedPost.value);
  }
  selectedPost.value = post;
}

function doneEditing(post) {
  selectedPost.value = null;
  post.renderMarkdown();
}

onMounted(() => {
})

onUnmounted(() => {
})

</script>

<template>  
  <div class="OuterPostsFeed">
    <div class="PostsFeed">
      <h1 class="Header">Posts</h1>
      <div class="ButtonRow">
        <button class="PrimaryButton" @click="newPost">New Post</button>
      </div>
      <div class="Post" v-for="post in feed.posts">
        <template v-if="selectedPost !== post">
          <div v-html="post.renderedMarkdown"></div>
          <button @click="editPost(post)">Edit</button>
        </template>
        <template v-else>
          <p>Date widget here</p>
          <input
            type="datetime-local"
            id="meeting-time"
            name="meeting-time"
            :value="post.date.toISOString()"
            @input="evt => post.date = new Date(evt.target.value)"
          />
          <textarea class="MarkdownTextArea" v-model="post.markdown"></textarea>
          <button @click="doneEditing(post)">Done</button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.OuterPostsFeed {
  width: 100%;
  height: 100vh;
  background-color: var(--dark-color);
}

.PostsFeed {
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

.Post {
  margin-bottom: var(--space-m);
}

.MarkdownTextArea {
  display: block;
  width: 100%;
  height: 400px;
  resize: vertical;
}
</style>
