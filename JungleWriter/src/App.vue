<script setup>
import { computed } from 'vue'
import { gApp } from './components/editor/State.js'
import SiteEditor from './components/editor/SiteEditor.vue'
import SiteList from './components/editor/SiteList.vue'
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
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
