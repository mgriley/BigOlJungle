<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp } from '../State.js'
import { copyToClipboard } from '../Utils.js'

const props = defineProps(['theLink'])

let btnText = ref("Copy");
let timerId = null;

function copyText() {
  copyToClipboard(props.theLink);

  btnText.value = "Copied!";
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(function() {
    btnText.value = "Copy";
  }, 1000);
}

</script>

<template>
  <div class="LinkSnippet">
    <p class="LinkText">{{ theLink }}</p>
    <button class="CopyButton SmallButton" @click="copyText">{{ btnText }}</button>
  </div>
</template>

<style scoped>
.LinkSnippet {
  display: flex;
}

.LinkText {
  padding: 0 5px;
  border: 1px solid var(--light-text-bg);
  border-radius: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 400px;
}

.CopyButton {
  margin-left: 10px;
}

</style>
