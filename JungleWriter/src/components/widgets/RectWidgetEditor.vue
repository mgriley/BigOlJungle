<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import ColorInput from './ColorInput.vue'
import SelectorInput from './SelectorInput.vue'
import BackgroundInput from './BackgroundInput.vue'
import BorderInput from './BorderInput.vue'
import PositionInput from './PositionInput.vue'
import StyleInput from './StyleInput.vue'
//import FilterInput from './FilterInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <div>
    <PositionInput :node="editorData" :includeSize="true" class="mb-m" />
    <BackgroundInput v-model="editorData.background" name="Background" class="mb-m" />
    <BorderInput v-model="editorData.border" name="Border" />
    <!-- <FilterInput v-model="editorData.filter" name="Filter" /> -->
    <!-- <FilterInput v-model="editorData.backdropFilter" name="Backdrop-Filter" /> -->
    <div class="mt-s">
      <StyleInput :node="editorData" />
    </div>
  </div>
</template>

<style scoped>
</style>
