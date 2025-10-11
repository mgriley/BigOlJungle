<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, } from './State.js'
import ColorInput from './widgets/ColorInput.vue'
import TextInput from './widgets/TextInput.vue'
import TextAreaInput from './widgets/TextAreaInput.vue'
import ImageInput from './widgets/ImageInput.vue'
import BoolInput from './widgets/BoolInput.vue'

let settings = gApp.site.getSettings();

</script>

<template>
  <div>
    <div class="mb-s">
      <ColorInput name="Background" :color="settings.backgroundColor" />
    </div>
    <div class="mb-m">
      <BoolInput v-model="settings.showDesignGuide" name="Show Design Guide" />
    </div>
    <div class="mb-s">
      <TextInput v-model="gApp.site.name" name="Project Name" placeholder="Enter project name..." />
    </div>
    <div class="mb-s">
      <TextInput v-model="settings.siteName" name="Site Name" placeholder="Enter site title..." />
    </div>
    <div class="mb-s">
      <TextAreaInput v-model="settings.description" name="Description"
        placeholder="Enter site description..."
        helpText="Ex. A site documenting the life of my goldfish."
      />
    </div>
    <div class="mb-s">
      <ImageInput v-model="settings.faviconSrcName" name="Favicon" />
      <p class="mute-text f-xs">We recommend a 48x48 .png file.</p>
    </div>
    <!--<ColorInput name="Foreground" :color="settings.foregroundColor" />-->
  </div>
</template>

<style>
</style>

<style scoped>
</style>
