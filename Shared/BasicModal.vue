<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'

const props = defineProps({
  title: {
    default: "",
  },
  showDone: {
    default: true,
  },
  doneText: {
    default: 'Done',
  },
  showCancel: {
    default: true,
  },
  cancelText: {
    default: 'Cancel',
  },
});

const emit = defineEmits(['onCancel', 'onDone'])

let dialog = ref(null);

function showModal() {
  dialog.value.showModal();
}

function closeModal() {
  dialog.value.close();
}

function toggleModal() {
  if (!dialog.value.open) {
    showModal();
  } else {
    closeModal();
  }
}

function onDone() {
  emit('onDone');
  closeModal();
}

function onCancel() {
  emit('onCancel');
  closeModal();
}

function handleNativeCancel() {
  emit('onCancel');
}

defineExpose({
  showModal, closeModal, toggleModal
})

/*
Note to future self: Do not attempt to do a `click away to dismiss` trick here, in javascript.
Ends up being very finnicky.
*/

</script>

<template>
  <dialog class="BasicModal" ref="dialog" @close="" @cancel="handleNativeCancel">
    <!-- Note: Only rendering the body when isOpen messes up the autofocus -->
    <!-- <div v-if="isOpen"> -->
      <div class="InnerModal">
        <h3 v-if="title" class="Title">{{ title }}</h3>
        <div class="Body">
          <slot>Default Body</slot>
        </div>
        
        <div class="Footer">
          <button class="TertiaryButton" v-if="showCancel" @click="onCancel">{{ cancelText }}</button>
          <button v-if="showDone" @click="onDone">{{ doneText }}</button>
        </div>
      </div>
    <!-- </div> -->
  </dialog>
</template>

<style scoped>

dialog::backdrop {
  /*backdrop-filter: blur(10px);*/
}

/* For some reason, the the regular CSS does not seem to work in the modal */
.BasicModal {
  color: var(--popup-text);
  background-color: var(--popup-bg);
  border: 1px solid var(--main-text);
  /*border: none;*/
  border-radius: var(--border-radius-large);
  padding: var(--space-m);
  min-width: 160px;
  max-width: 90%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 5vh;
}

dialog::backdrop {
  /*backdrop-filter: blur(4px) invert(80%);*/
  /* Note - this invert looks oddly good */
  /* backdrop-filter: invert(80%); */
  backdrop-filter: blur(4px);
}

@media (max-width: 600px) {
  .BasicModal {
    position: fixed;
    top: 0;
    left: 0;
    border: none;
    border-radius: 0;
    max-width: 100vw;
    width: 100vw;
    height: 100vh;
    overflow-y: scroll;
  }
}

.BasicModal .Title {
  margin-bottom: var(--space-xs);
}

.Body {
  margin-bottom: var(--space-l);
}

.Footer {
  float: right;
}

.Footer button {
  margin-right: var(--space-s);
}

.Footer button:last-child {
  margin-right: 0;  
}

</style>
