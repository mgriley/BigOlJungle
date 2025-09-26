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
let isResizing = ref(false);
let resizeType = ref('');
let initialSize = ref({ width: 0, height: 0 });
let initialPos = ref({ x: 0, y: 0 });

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

function startResize(event, type) {
  isResizing.value = true;
  resizeType.value = type;
  
  const rect = dialog.value.getBoundingClientRect();
  initialSize.value = {
    width: rect.width,
    height: rect.height
  };
  initialPos.value = {
    x: event.clientX,
    y: event.clientY
  };
  
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  event.preventDefault();
  event.stopPropagation();
}

function handleResize(event) {
  if (!isResizing.value) return;
  
  const deltaX = event.clientX - initialPos.value.x;
  const deltaY = event.clientY - initialPos.value.y;
  
  let newWidth = Math.max(300, initialSize.value.width + deltaX);
  let newHeight = Math.max(200, initialSize.value.height + deltaY);
  
  dialog.value.style.width = `${newWidth}px`;
  dialog.value.style.height = `${newHeight}px`;
  dialog.value.style.margin = '0';
}

function stopResize() {
  isResizing.value = false;
  resizeType.value = '';
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
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
      </div>
      
      <div class="Body">
        <slot>Default Body</slot>
      </div>
      
      <div class="Footer">
        <button class="CloseButton" @click="closeModal" title="Close">
          Close
        </button>
      </div>
      
      <!-- Resize handle -->
      <div class="ResizeHandle" @mousedown="startResize($event, 'bottom-right')">
        <i class="bi bi-arrows-angle-expand"></i>
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
  padding: var(--space-xs) var(--space-m) var(--space-m) var(--space-m);
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.Header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid var(--medium-color);
  margin-bottom: var(--space-s);
  padding: var(--space-xxs);
}

.DragHandle {
  cursor: move;
  width: 100%;
  padding: var(--space-xs);
  color: var(--light-color);
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.DragHandle:hover {
  color: var(--primary-color);
}

.Footer {
  display: flex;
  justify-content: center;
  margin-top: var(--space-s);
}

.CloseButton {
  background-color: var(--input-bg);
  border: 1px solid var(--medium-color);
  color: var(--input-text);
  cursor: pointer;
  border-radius: var(--border-radius-s);
  padding: var(--space-xs) var(--space-s);
  font-size: var(--f-s);
  transition: all 0.2s ease;
}

.CloseButton:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.Body {
  margin-bottom: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ResizeHandle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  cursor: se-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--light-color);
  font-size: 16px;
  z-index: 10;
}

.ResizeHandle:hover {
  color: var(--primary-color);
  background-color: var(--medium-color);
}

@media (max-width: 600px) {
  .TextEntryModal {
    min-width: 90%;
    max-width: 95%;
  }
}

</style>
