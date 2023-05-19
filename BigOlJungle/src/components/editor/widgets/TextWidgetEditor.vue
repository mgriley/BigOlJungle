<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'

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
  <NumberInput v-model="editorData.fontSize" min="1"/>
  <!--<input v-model="editorData.text">-->
  <textarea class="TextWidgetTextArea" v-model="editorData.text"></textarea>
</template>

<style>
.TextWidgetTextArea {
  margin-top: 24px;
}
</style>

<style scoped>

</style>
