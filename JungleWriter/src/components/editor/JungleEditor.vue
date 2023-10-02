<script setup>
import { computed } from 'vue'
import { gApp } from './State.js'
import SiteEditor from './SiteEditor.vue'
import SiteList from './SiteList.vue'

</script>

<template>
  <template v-if="gApp.site">
    <SiteEditor />
  </template>
  <template v-else>
    <SiteList />
  </template>
</template>

<style scoped>

</style>
