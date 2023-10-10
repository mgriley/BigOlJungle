<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextAlignInput from './TextAlignInput.vue'
import FontInput from './FontInput.vue'
import ColorInput from './ColorInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <div>
    Image editor!
  </div>
</template>

<style scoped>
</style>
