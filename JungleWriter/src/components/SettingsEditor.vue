<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, } from './State.js'
import ColorInput from './widgets/ColorInput.vue'

let settings = gApp.site.getSettings();

</script>

<template>
  <div>
    <ColorInput name="Background" :color="settings.backgroundColor" />
    <!--<ColorInput name="Foreground" :color="settings.foregroundColor" />-->
  </div>
</template>

<style>
</style>

<style scoped>
</style>
