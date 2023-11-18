<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem, removeElem } from './Utils.js'
import FileEditor from './FileEditor.vue'

let feed = gApp.site.postsFeed;
let selectedPost = ref(null);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

function newPost() {
  let post = reactive(new Post());
  post.body = "Your text goes here"
  addElem(feed.posts, post, 0);
  editPost(post);
}

function editPost(post) {
  if (selectedPost.value) {
    doneEditing(selectedPost.value);
  }
  selectedPost.value = post;
}

function deletePost(post) {
  // TODO - add a confirmation prompt
  if (post == selectedPost.value) {
    selectedPost.value = null;
  }
  removeElem(feed.posts, post);
}

function doneEditing(post) {
  selectedPost.value = null;
  post.renderMarkdown();
}

function toDateString(postDate) {
  const options = {
    weekday: 'short',
    //year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return postDate.toLocaleDateString(undefined, options);
}

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
  <FileEditor v-if="isEditing" />
  <div class="OuterPostsFeed">
    <div class="PostsFeed">
      <h1 class="Header">Posts</h1>
      <div class="ButtonRow">
        <button class="SmallButton" @click="newPost">New Post</button>
      </div>
      <div class="Post" v-for="post in feed.posts">
        <template v-if="selectedPost !== post">
          <div class="PostHeaderBox">
            <h4>{{toDateString(post.date)}}</h4>
            <button class="SmallButton" @click="editPost(post)">Edit</button>
          </div>
          <div v-if="post.renderedMarkdown" v-html="post.renderedMarkdown"></div>
          <div v-else>
            <p>This post is empty...</p>
          </div>
        </template>
        <template v-else>
          <div class="PostHeaderBox">
            <input
              class="DateInput"
              type="date"
              id="meeting-time"
              name="meeting-time"
              :value="post.date.toISOString().split('T')[0]"
              @input="evt => post.date = new Date(evt.target.value)"
            />
            <button class="SmallButton" @click="doneEditing(post)">Done</button>
          </div>
          <textarea class="MarkdownTextArea" v-model="post.markdown"></textarea>
          <button class="SmallButton" @click="deletePost(post)">Delete</button>
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

.PostHeaderBox {
  display: flex;
  gap: 24px;
  align-items: baseline;
  margin-bottom: 8px;
}

.DateInput {
  display: block;
  font-size: 24px;
}

.MarkdownTextArea {
  display: block;
  width: 100%;
  height: 400px;
  resize: vertical;
}
</style>
