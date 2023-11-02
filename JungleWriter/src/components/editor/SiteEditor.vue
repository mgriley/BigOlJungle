<script setup>
import { reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import ShortcutBtns from './ShortcutBtns.vue'

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

</script>

<template>  
  <NavBar v-if="isEditing" />
  <ShortcutBtns />

  <router-view></router-view>
</template>

<style scoped>
</style>
