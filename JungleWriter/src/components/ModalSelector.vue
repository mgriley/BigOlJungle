<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['options'])
const emit = defineEmits(['choose'])

let show = ref(false);
let lastShowTime = 0;
let modalPosition = ref({ top: 0, left: 0 });

function showModal(clickEvt) {
  show.value = true;
  lastShowTime = Date.now() / 1000.0;

  if (clickEvt) {
    clickEvt.triggeredShow = true;
    
    // Position the modal relative to the button that was clicked
    const rect = clickEvt.target.getBoundingClientRect();
    modalPosition.value = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
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

function onSelectedOption(option) {
  emit('choose', option);
  closeModal();
}

function getOptionStyle(option) {
  return option.style || {};  
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
        console.log("Hiding");
        show.value = false;
      }
    }
  });  
});

</script>

<template>
  <div v-if="show" class="ModalSelector">
    <div 
      class="modal-container"
      :style="{
        position: 'fixed',
        top: modalPosition.top + 'px',
        left: modalPosition.left + 'px'
      }"
    >
      <div class="Option TextButton" v-for="option in options" :style="getOptionStyle(option)" @click="onSelectedOption(option)">
        <i v-if="option.icon" :class="option.icon" class="mr-xs"></i>
        <span>{{ option.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ModalSelector {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

.modal-container {
  z-index: 1001;
  background-color: blue;
  border-radius: var(--border-radius-sm);
  min-width: 160px;
  max-height: 60vh;
  max-width: 90vw;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.Option {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-s);
  font-weight: normal;
  color: white;
  cursor: pointer;
}

.Option a {
  text-decoration: none;
}

.Option:hover {
  background-color: darkblue;
}

.Option i {
  width: 16px;
  flex-shrink: 0;
}

.CancelOption {
  background-color: var(--medium-color);  
}

</style>
