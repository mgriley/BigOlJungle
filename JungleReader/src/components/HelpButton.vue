<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'

const props = defineProps({
  text: {
    type: String,
  },
  title: {
    default: "Help"
  },
})

let helpModal = ref(null);

function showHelp() {
  console.log("Showing help!")
  helpModal.value.showModal();
}

</script>

<template>
  <button class="HelpButton" @click="showHelp">
    {{ title }}
  </button>
  <BasicModal ref="helpModal" :showCancel="false" :title="title">
    <div v-html="text"></div>
  </BasicModal>
</template>

<style scoped>
</style>
