<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import PositionInput from './PositionInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <div>
    <PositionInput :node="editorData" />
  </div>
</template>

<style>
</style>

<style scoped>
</style>
