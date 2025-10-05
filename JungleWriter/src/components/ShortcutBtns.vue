<script setup>
import { gApp } from './State.js'

function togglePreview() {
  gApp.site.deselectAll();
  gApp.site.setIsEditing(!gApp.site.getIsEditing());
}

</script>

<template>  
  <div class="ShortcutBtns">
    <button class="MenuIcon NoSelect" @click="togglePreview">
      <i class="bi bi-eye"></i>
      {{ gApp.site.getIsEditing() ? 'Preview' : 'Done' }}
    </button>
  </div>
</template>

<style scoped>
.ShortcutBtns {
  z-index: 2000;
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  flex-flow: row nowrap;
  gap: 4px;
}

.MenuIcon {
  border: 1px solid var(--main-text);
  /* border-radius: var(--border-radius-med); */
  display: inline-block;
  padding: var(--space-xs) var(--space-xxs);
  background-color: var(--dark-color);
  color: var(--main-text);
  cursor: pointer;
  font-size: var(--f-s);
  min-width: 120px;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.MenuIcon i {
  margin-right: 6px;
  font-size: 16px;
}

</style>

