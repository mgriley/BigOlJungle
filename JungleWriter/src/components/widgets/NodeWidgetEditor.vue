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
    <div v-if="editorData.isRoot()">
      Root Node at ({{editorData.posX}}, {{editorData.posY}})
    </div>
    <div v-else>
      <PositionInput :node="editorData" />
    </div>
  </div>
</template>

<style>
</style>

<style scoped>
</style>
