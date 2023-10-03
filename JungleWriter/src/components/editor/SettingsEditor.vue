<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, Node } from './State.js'
import EditorPane from './EditorPane.vue'
import ColorInput from './widgets/ColorInput.vue'

let settings = gApp.site.getSettings();

</script>

<template>
  <EditorPane paneTitle="Settings" paneId="SiteSettings" :startX="800" :startY="100">
    <ColorInput name="Background Color" v-model="settings.backgroundColor" />
  </EditorPane>
</template>

<style>
</style>

<style scoped>
</style>
