<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

/*const props = defineProps(['options'])*/

const props = defineProps({
  showDone: {
    default: true,
  },
  showCancel: {
    default: true,
  }
});

let show = ref(false);
let lastShowTime = 0;

function showModal(clickEvt) {
  show.value = true;
  lastShowTime = Date.now() / 1000.0;

  if (clickEvt) {
    clickEvt.triggeredShow = true;
  }
}

function closeModal() {
  show.value = false;
}

function toggleModal(clickEvt) {
  if (!show.value) {
    showModal(clickEvt);
  } else {
    closeModal();
  }
}

defineExpose({
  showModal, closeModal, toggleModal
})

onMounted(() => {
  document.addEventListener("click", function(event) {
    // Dismiss the modal by clicking outside
    // Note: the time comparison is a bit of a hack to prevent the click event
    // that opened the modal from immediately closing it.
    if (show.value === true) {
      let curTime = Date.now() / 1000.0;
      if (!event.target.closest(".ModalSelector") &&
          event.triggeredShow !== true &&
        curTime - lastShowTime > 0.25) {
        show.value = false;
      }
    }
  });  
});

</script>

<template>
  <div v-if="show" class="ModalSelector modal-mask">
    <div class="modal-container">
      <div class="Body">
        <slot>Default Body</slot>
      </div>
      
      <div class="Footer">
        <button v-if="showCancel" @click="closeModal">Cancel</button>
        <button v-if="showDone" @click="closeModal">Done</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
/*
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
*/
}

.modal-container {
  padding: 0.75em 0.75em;
  position: absolute;
  z-index: 200;
  background-color: #f1f1f1;
  min-width: 160px;
  /*box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);*/

  /*width: 200px;*/
  margin: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.Body {
  margin-bottom: 20px;
}

.Footer {
  float: right;
}

/*
.modal-container {
  width: 300px;
  margin: auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}
*/

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

</style>
