<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'

/*const props = defineProps(['options'])*/

const props = defineProps({
  title: {
    default: "",
  },
  showDone: {
    default: true,
  },
  showCancel: {
    default: true,
  },
  showDelete: {
    default: false,
  },
});

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
      if (!event.target.closest(".modal-container") &&
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
  <dialog class="ModalSelector modal-container" ref="dialog" @close="isOpen = false">
    <div v-if="isOpen">
      <p v-if="title" class="Title">{{ title }}</p>
      <div class="Body">
        <slot>Default Body</slot>
      </div>
      
      <div class="Footer">
        <button v-if="showDelete" @click="">Delete</button>
        <button v-if="showCancel" @click="closeModal">Cancel</button>
        <button v-if="showDone" @click="closeModal">Done</button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
/*
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
}
*/

.modal-container {
  padding: 0.75em 0.75em;
  min-width: 160px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  margin: auto;
}

.Body {
  margin-bottom: 20px;
}

.Footer {
  float: right;
}

.modal-container a {
  color: black;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
}

.CancelOption {
  background-color: lightblue;  
}

.modal-container a:hover {
  background-color: #ddd;
}

/*
.modal-default-button {
  float: right;
}
*/

.Title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 20px;
}

</style>
