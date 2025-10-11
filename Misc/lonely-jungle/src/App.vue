<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, isDebugging, } from './State.js'
import ChatWindow from './ChatWindow.vue'

function goToPage(username) {
  gApp.goToPage(username)
}
</script>

<template>
  <div class="Sidebar">
    <p>Me: {{ gApp.getUser().username }}</p>
    <!-- Left off here -->
    <!-- <router-link to="/search">Search</router-link> -->
    <router-link to="/">Home</router-link>
    <div v-for="friend in gApp.getUser().friendsList.friends">
      <button @click="goToPage(friend.username)">{{ friend.username }} {{ friend.isOnline ? "(Online)" : "" }}</button>
    </div>
    <router-link to="/settings">Settings</router-link>
    <p>Debug:</p>
    <button @click="gApp.changeUser('user-a')">user-a</button>
    <button @click="gApp.changeUser('user-b')">user-b</button>
    <button @click="gApp.changeUser('user-c')">user-c</button>
  </div>
  <div>
    <router-view></router-view>
    <ChatWindow />
    <div v-if="isDebugging">
      <button @click="gApp.getUser().dumpState()">Dump state</button>
    </div>
  </div>
</template>

<style scoped>
.Sidebar {
}
</style>
