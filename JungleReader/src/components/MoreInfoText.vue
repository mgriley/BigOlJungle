<script setup>
import { ref, onMounted, computed } from 'vue'

let props = defineProps({
  text: String,
  showEllipse: {
    default: false,
    type: Boolean
  }
})

let showMoreInfo = ref(false);

</script>

<template>
  <div>
    <button class="SmallButton" @click="showMoreInfo = !showMoreInfo">{{ text }}{{ (showEllipse && !showMoreInfo) ? "..." : "" }}</button>
    <template v-if="showMoreInfo">
      <p class="DisclosureBody">
        <slot>Default text</slot>
      </p>
    </template>
  </div>
</template>

<style scoped>
</style>
