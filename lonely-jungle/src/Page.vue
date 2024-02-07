<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import PostsList from './PostsList.vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  page: Object,
})

console.log("Rendering page: ", props.page);

</script>

<template>
  <div>
    <h1>{{ page.title }}</h1>
    <div class="HeaderSection">
      <p>Status:</p>
      <p>
      {{ page.statusUpdate.body }}
      </p>
      <p>Description:</p>
      <p>
      {{ page.description }}
      </p>
    </div>
    <h2>Paintings</h2>
    <p>TODO</p>
    <h2>Photography</h2>
    <p>TODO</p>
    <h2>Poems</h2>
    <PostsList :postsList="page.poems" :isEditable="page.isEditable" />
  </div>
</template>

<style scoped>
</style>
