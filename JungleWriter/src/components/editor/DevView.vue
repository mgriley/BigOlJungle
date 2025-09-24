<script setup>
import { gApp } from './State.js'

function goToSiteList() {
  gApp.router.push({name: 'sitelist'});
}

</script>

<template>
  <div class="Container">
    <div class="DevView">
      <h1 class="PageHeader">Developer Tools</h1>
      <div class="MarginBotS">
        <button @click="goToSiteList">Back to Site List</button>
      </div>
      <div class="DevControls">
        <div>Debug Controls</div>
        <button @click="gApp.userStorage.dumpAll()" class="TertiaryButton">Dump storage</button>
        <button @click="gApp.userStorage.clearAll()" class="TertiaryButton">Clear storage</button>
        <button @click="gApp.fileStorage.dump()" class="TertiaryButton">Dump file storage</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.DevView {
  margin: 0 auto;
  margin-top: var(--space-xl);
  background-color: var(--input-bg);
  padding: 16px;
  border: var(--border-reg);
  max-width: 800px;
}

.DevControls {
  margin-top: var(--space-xl);
  border-top: 1px solid var(--secondary-text);
  padding-top: var(--space-xs);
}

.DevControls button {
  display: block;
  margin-bottom: var(--space-xs);
}

</style>
