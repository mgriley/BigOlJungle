<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, } from './State.js'
import ColorInput from './widgets/ColorInput.vue'
import TextInput from './widgets/TextInput.vue'

let settings = gApp.site.getSettings();

</script>

<template>
  <div>
    <div class="mb-s">
      <TextInput v-model="settings.siteName" name="Site Name" placeholder="Enter site title..." />
    </div>
    <ColorInput name="Background" :color="settings.backgroundColor" />
    <!--<ColorInput name="Foreground" :color="settings.foregroundColor" />-->
  </div>
</template>

<style>
</style>

<style scoped>
</style>
