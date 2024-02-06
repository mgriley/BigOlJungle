<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'

function goToPage(username) {
  gApp.goToPage(username)
}
</script>

<template>
  <div class="Sidebar">
    <!-- Left off here -->
    <!-- <router-link to="/search">Search</router-link> -->
    <div v-for="friend in gApp.friendsList.friends">
      <button @click="goToPage(friend.username)">{{ friend.username }} {{ friend.isOnline ? "(Online)" : "" }}</button>
    </div>
    <router-link to="/settings">Settings</router-link>
  </div>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>
.Sidebar {
}
</style>
