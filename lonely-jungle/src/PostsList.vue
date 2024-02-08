<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, PostsList, Post, } from './State.js'
import { addElem, removeElem } from './Utils.js'
import TextInput from './TextInput.vue'

const props = defineProps({
  postsList: Object,
  isEditable: Boolean,
})

let selectedPost = ref(null);

function newPost() {
  console.log("Adding post!");
  let post = reactive(new Post());
  post.body = "Your text goes here"
  addElem(props.postsList.posts, post, 0);
  console.log("PostsList: ", props.postsList);
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
  removeElem(props.postsList.posts, post);
}

function doneEditing(post) {
  selectedPost.value = null;
  // post.renderMarkdown();
}

onMounted(() => {
  // Re-render all posts so that imgs show up properly
  /*
  for (const post of props.postsList.posts) {
    post.renderMarkdown();
  }
  */
})

onUnmounted(() => {
})

</script>

<template>
  <div class="PostsFeed">
    <div v-if="isEditable" class="ButtonRow">
      <button class="SmallButton" @click="newPost">New Post</button>
    </div>
    <p>{{ postsList.posts.length }} posts</p>
    <div class="Post" v-for="post in postsList.posts">
      <template v-if="selectedPost !== post">
        <div class="PostHeaderBox">
          <h4>{{post.title || 'Untitled' }}</h4>
          <p>{{post.dateString()}}</p>
          <button v-if="isEditable" class="SmallButton" @click="editPost(post)">Edit</button>
        </div>
        <div class="PostBody" v-if="post.body" >{{ post.body }}</div>
        <!-- <div v-if="post.renderedMarkdown" v-html="post.renderedMarkdown"></div> -->
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
        <textarea class="BodyTextArea" v-model="post.body"></textarea>
        <button class="SmallButton" @click="deletePost(post)">Delete</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
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

.PostBody {
  white-space: pre-wrap;
}

.DateInput {
  display: block;
  font-size: 24px;
}

.BodyTextArea {
  display: block;
  width: 100%;
  height: 400px;
  resize: vertical;
}
</style>
