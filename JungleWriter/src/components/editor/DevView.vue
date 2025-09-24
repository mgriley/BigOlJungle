<script setup>
import { gApp } from './State.js'

</script>

<template>
  <div class="DevView">
    <div class="DevControls">
      <div>Debug Controls</div>
      <button @click="gApp.userStorage.dumpAll()" class="TertiaryButton">Dump storage</button>
      <button @click="gApp.userStorage.clearAll()" class="TertiaryButton">Clear storage</button>
      <button @click="gApp.fileStorage.dump()" class="TertiaryButton">Dump file storage</button>
    </div>
  </div>
</template>

<style scoped>
.DevView {
  max-width: 400px;
}

.DevControls {
  margin-top: var(--space-s);
  padding-top: var(--space-xs);
}

.DevControls button {
  display: block;
  margin-bottom: var(--space-xs);
  width: 100%;
}

</style>
