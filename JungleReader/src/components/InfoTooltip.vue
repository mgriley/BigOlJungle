<script setup>
import { ref, onMounted, computed } from 'vue'

let props = defineProps({
  title: {
    default: "Info",
    type: String
  },
  text: String,
})

</script>

<template>
  <div class="Tooltip">
    <p>{{title}}</p>
    <span class="TooltipText">{{text}}</span>
  </div>
</template>

<style scoped>
.Tooltip {
  position: relative;
  display: inline-block;
}

.Tooltip .TooltipText {
  visibility: hidden;
  width: 320px;
  background-color: black;
  color: var(--main-text);
  border-radius: 4px;
  padding: 8px 4px;

  position: absolute;
  z-index: 1000;
}

.Tooltip:hover .TooltipText {
  visibility: visible;
}
</style>
