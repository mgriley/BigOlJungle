<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  editorData: Object
})

let colorRef = computed({
  get() {
    return "MyColor";
  },
  set(newValue) {
  }
})

</script>

<template>
  <input v-model="editorData.text">
  <!--<input type="number" v-model="editorData.fontSize" min="1">-->
</template>

<style scoped>

</style>
