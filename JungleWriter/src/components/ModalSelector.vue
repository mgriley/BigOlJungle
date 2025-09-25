<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['options'])
const emit = defineEmits(['choose'])

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
    <div class="modal-container">
      <div class="Option TextButton" v-for="option in options" :style="getOptionStyle(option)" @click="onSelectedOption(option)">
        <i v-if="option.icon" :class="option.icon" class="mr-xs"></i>
        <span>{{ option.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-container {
  position: absolute;
  z-index: 200;
  background-color: blue;
  border-radius: var(--border-radius-sm);
  min-width: 160px;
  margin: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
