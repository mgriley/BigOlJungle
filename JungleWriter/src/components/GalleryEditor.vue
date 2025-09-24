<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, Post } from './State.js'
import { addElem, removeElem } from './Utils.js'
import FileEditor from './FileEditor.vue'
import TextInput from './widgets/TextInput.vue'

// Note: currently unused.

/*
const props = defineProps({
  gallery: Object,
})
*/

let gallery = gApp.site.gallery;

let selectedPost = ref(null);

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

function newPost() {
  console.log("Adding post!");
  let post = reactive(new Post());
  post.body = "Your text goes here"
  addElem(props.feed.posts, post, 0);
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
  removeElem(props.feed.posts, post);
}

function doneEditing(post) {
  selectedPost.value = null;
  post.renderMarkdown();
}

onMounted(() => {
  // Re-render all posts so that imgs show up properly
  /*
  for (const post of props.feed.posts) {
    post.renderMarkdown();
  }
  */
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
      <div class="Post" v-for="post in gallery.posts">
        <template v-if="selectedPost !== post">
          <div class="PostHeaderBox">
            <h4>{{post.title || 'Untitled' }}</h4>
            <p>{{post.dateString()}}</p>
            <button class="SmallButton" @click="editPost(post)">Edit</button>
          </div>
          <div v-if="post.renderedMarkdown" v-html="post.renderedMarkdown"></div>
          <div v-else>
            <p>This post is empty...</p>
          </div>
        </template>
        <template v-else>
          <div class="PostHeaderBox">
            <TextInput v-model="post.title" name="Title" />
            <input
              class="DateInput"
              type="date"
              id="meeting-time"
              name="meeting-time"
              :value="post.date.toISOString().split('T')[0]"
              @input="evt => post.date = new Date(evt.target.value)"
            />
            <button class="SmallButton" @click="doneEditing(post)">Done Editing</button>
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
