<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import Page from './Page.vue'
</script>

<template>
  <div>
    <Page :username="gApp.getUser().username" :page="gApp.getUser().page" />
  </div>
</template>

<style scoped>
</style>
