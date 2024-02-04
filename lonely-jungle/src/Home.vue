<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import PostsList from './PostsList.vue'
</script>

<template>
  <div>
    <h1>Your Page Name</h1>
    <div>
      <p>
      Your description of yourself goes here.
      </p>
    </div>
    <h2>Gallery</h2>
    <p>Images go here</p>
    <h2>Poems</h2>
    <PostsList :postsList="gApp.poems" :isEditable="true" />
  </div>
</template>

<style scoped>
</style>
