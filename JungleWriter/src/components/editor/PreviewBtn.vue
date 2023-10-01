<script setup>
import { kMenuItems } from './State.js'
import { gApp } from './State.js'

function togglePreview() {
  gApp.site.setIsEditing(!gApp.site.getIsEditing());
}

</script>

<template>  
  <div class="PreviewBtn">
    <button class="MenuIcon" @click="togglePreview">
      Preview <vue-feather v-if="!gApp.site.getIsEditing()" type="x" class="XIcon" />
    </button>
  </div>
</template>

<style scoped>
.PreviewBtn {
  position: absolute;
  display: flex;
  right: 16px;
  bottom: 16px;
  display: inline-block;
  z-index: 10;
}

.MenuIcon {
  border: 1px solid var(--main-text);
  /* border-radius: var(--border-radius-med); */
  display: inline-block;
  padding: 6px;
  background-color: var(--dark-color);
  color: var(--main-text);
  cursor: pointer;
  font-size: var(--smaller-size);

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
}

.XIcon {
  margin-left: 4px;
}

</style>

