<script setup>
import { gApp } from './State.js'

function togglePreview() {
  gApp.site.setIsEditing(!gApp.site.getIsEditing());
}

</script>

<template>  
  <div class="ShortcutBtns">
    <button class="MenuIcon mr-xxs" v-if="gApp.site.getIsEditing()" @click="gApp.site.save()">
      <i class="bi bi-floppy"></i>
      Save
    </button>
    <button class="MenuIcon" @click="togglePreview">
      <i class="bi bi-eye"></i>
      {{ gApp.site.getIsEditing() ? 'Preview' : 'Done Preview' }}
    </button>
  </div>
</template>

<style scoped>
.ShortcutBtns {
  z-index: 2000;
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-flow: row nowrap;
  gap: 4px;
}

.MenuIcon {
  border: 1px solid var(--main-text);
  /* border-radius: var(--border-radius-med); */
  display: inline-block;
  padding: var(--space-xs) var(--space-s);
  background-color: var(--dark-color);
  color: var(--main-text);
  cursor: pointer;
  font-size: var(--smaller-size);
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

