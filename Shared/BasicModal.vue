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
  showDelete: {
    default: false,
  },
});

const emit = defineEmits(['onDelete', 'onCancel', 'onDone'])

let dialog = ref(null);
let isOpen = ref(false);
let lastShowTime = 0;

function showModal(clickEvt) {
  dialog.value.showModal();
  isOpen.value = true;
  lastShowTime = Date.now() / 1000.0;

  if (clickEvt) {
    clickEvt.triggeredShow = true;
  }
}

function closeModal() {
  dialog.value.close();
}

function toggleModal(clickEvt) {
  if (!dialog.value.open) {
    showModal(clickEvt);
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

defineExpose({
  showModal, closeModal, toggleModal
})

onMounted(() => {
  /*
  // Note: this causes a lot of issues, so avoid for now. Can use Esc to dismiss.
  document.addEventListener("click", function(event) {
    // Dismiss the modal by clicking outside
    // Note: the time comparison is a bit of a hack to prevent the click event
    // that opened the modal from immediately closing it.
    if (dialog.value.open) {
      let curTime = Date.now() / 1000.0;
      if (!event.target.closest(".BasicModal") &&
          event.triggeredShow !== true &&
        curTime - lastShowTime > 0.25) {
        closeModal();
      }
    }
  });  
  */
});

</script>

<template>
  <dialog class="BasicModal" ref="dialog" @close="isOpen = false">
    <!-- Note: Only rendering the body when isOpen messes up the autofocus -->
    <!-- <div v-if="isOpen"> -->
      <div v-if="title" class="Title">{{ title }}</div>
      <div class="Body">
        <slot>Default Body</slot>
      </div>
      
      <div class="Footer">
        <button v-if="showDelete" @click="emit('onDelete')" class="DeleteBtn">Delete</button>
        <button v-if="showCancel" @click="onCancel">{{ cancelText }}</button>
        <button v-if="showDone" @click="onDone">{{ doneText }}</button>
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
  border-radius: 10px;
  padding: 0.75em 0.75em;
  min-width: 160px;
  /*box-shadow: 0 4px 12px var(--main-text);*/
  margin: auto;
}

.BasicModal .Title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.Body {
  margin-bottom: 20px;
}

.Footer {
  float: right;
}

.Footer button {
  margin-right: 4px;
}

.DeleteBtn {
  margin-right: 20px;
}

</style>
