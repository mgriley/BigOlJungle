<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import PostsList from './PostsList.vue'
import TextInput from './TextInput.vue'

const props = defineProps({
  page: Object,
})

let isEditable = props.page.editable;
let editingProfile = ref(false);

console.log("Rendering page: ", props.page);

</script>

<template>
  <div>
    <div>
      <h1 v-if="!editingProfile">{{ page.title }}</h1>
      <TextInput v-else v-model="page.title" name="Title" />
      <div class="HeaderSection">
        <p>Status:</p>
        <p v-if="!editingProfile">
        {{ page.statusUpdate.body }}
        </p>
        <textarea v-else class="BodyTextArea" v-model="page.statusUpdate.body"></textarea>

        <p>Description:</p>
        <p v-if="!editingProfile">
        {{ page.description }}
        </p>
        <textarea v-else class="BodyTextArea" v-model="page.description"></textarea>

        <button v-if="isEditable" @click="editingProfile = !editingProfile">
          {{ !editingProfile ? "Edit" : "Done" }}
        </button>
      </div>
    </div>
    <h2>Paintings</h2>
    <p>TODO</p>
    <h2>Photography</h2>
    <p>TODO</p>
    <h2>Poems</h2>
    <PostsList :postsList="page.poems" :isEditable="page.editable" />
  </div>
</template>

<style scoped>
.BodyTextArea {
  display: block;
  width: 100%;
  height: 100px;
  resize: vertical;
}
</style>
