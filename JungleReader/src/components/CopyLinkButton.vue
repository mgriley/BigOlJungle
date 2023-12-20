<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp } from '../State.js'
import { copyToClipboard } from '../Utils.js'

const props = defineProps({
  title: {
    type: String,
    default: 'Copy Share Link'
  },
  theLink: {
    type: String,
  }
})

let showCopiedText = ref(false);
let timerId = null;

function copyText() {
  copyToClipboard(props.theLink);

  showCopiedText.value = true;
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(function() {
    showCopiedText.value = false;
  }, 1000);
}

let btnText = computed(() => {
  return showCopiedText.value ? "Copied!" : props.title;
})

</script>

<template>
  <button class="CopyButton SmallButton" @click="copyText">
    <vue-feather type="link" stroke-width="2.0" class="Icon" />
    {{ btnText }}
  </button>
</template>

<style scoped>
.CopyButton {
  display: flex;
  gap: 8px;
  align-items: center;
}


.Icon {
  color: var(--brand-color-yellow);
}

</style>
