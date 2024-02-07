<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gApp, } from './State.js'
import Page from './Page.vue'
</script>

<template>
  <div>
    <Page :page="gApp.userPage.value" />
  </div>
</template>

<style scoped>
</style>
