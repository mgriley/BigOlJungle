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
  flex-flow: row nowrap;
}

.LinkText {
  flex: 1 50px;
  padding: 0 5px;
  border-radius: 5px;
  border: 1px solid var(--secondary-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 30ch;
  min-width: 10px;
}

.CopyButton {
  margin-left: 10px;
  margin-top: 0;
  margin-bottom: 0;
}

</style>
