<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'

const props = defineProps({
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
let isDragging = ref(false);
let dragOffset = ref({ x: 0, y: 0 });

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

function startDrag(event) {
  isDragging.value = true;
  const rect = dialog.value.getBoundingClientRect();
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', stopDrag);
  event.preventDefault();
}

function handleDrag(event) {
  if (!isDragging.value) return;
  
  const newX = event.clientX - dragOffset.value.x;
  const newY = event.clientY - dragOffset.value.y;
  
  dialog.value.style.left = `${newX}px`;
  dialog.value.style.top = `${newY}px`;
  dialog.value.style.margin = '0';
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', stopDrag);
}

defineExpose({
  showModal, closeModal, toggleModal
})

</script>

<template>
  <dialog class="TextEntryModal" ref="dialog" @close="" @cancel="handleNativeCancel">
    <div class="InnerModal">
      <div class="Header">
        <div class="DragHandle" @mousedown="startDrag">
          <i class="bi bi-grip-horizontal"></i>
        </div>
        <button class="CloseButton" @click="closeModal" title="Close">
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div class="Body">
        <slot>Default Body</slot>
      </div>
    </div>
  </dialog>
</template>

<style scoped>

.TextEntryModal {
  color: var(--popup-text);
  background-color: var(--popup-bg);
  border: var(--popup-border);
  border-radius: var(--border-radius-m);
  padding: 0;
  min-width: 400px;
  max-width: 90%;
  margin: 0;
  position: fixed;
  top: 20vh;
  left: 50%;
  transform: translateX(-50%);
}

.TextEntryModal::backdrop {
  background: transparent;
}

.InnerModal {
  padding: var(--space-s) var(--space-m);
}

.Header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--medium-color);
  margin-bottom: var(--space-s);
  padding-bottom: var(--space-xxs);
}

.DragHandle {
  cursor: move;
  padding: var(--space-xxs);
  color: var(--light-color);
  user-select: none;
  flex: 1;
  text-align: center;
}

.DragHandle:hover {
  color: var(--primary-color);
}

.CloseButton {
  background: none;
  border: none;
  color: var(--light-color);
  cursor: pointer;
  padding: var(--space-xxs);
  border-radius: var(--border-radius-s);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: var(--f-s);
}

.CloseButton:hover {
  background-color: var(--medium-color);
  color: var(--primary-color);
}

.Body {
  margin-bottom: 0;
}

@media (max-width: 600px) {
  .TextEntryModal {
    min-width: 90%;
    max-width: 95%;
  }
}

</style>
