<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Edit Text'
  },
  placeholder: {
    type: String,
    default: 'Enter your text content here...'
  },
  updateWhileTyping: {
    type: Boolean,
    default: false
  },
  isCodeEditor: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue'])

const localValue = ref('')

// Watch for changes to localValue and emit updates if updateWhileTyping is enabled
watch(localValue, (newValue) => {
  if (props.updateWhileTyping) {
    emit('update:modelValue', newValue)
  }
})

let dialog = ref(null);
let isDragging = ref(false);
let dragOffset = ref({ x: 0, y: 0 });
let isResizing = ref(false);
let resizeType = ref('');
let initialSize = ref({ width: 0, height: 0 });
let initialPos = ref({ x: 0, y: 0 });

function showModal() {
  localValue.value = props.modelValue;
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
  emit('update:modelValue', localValue.value);
  closeModal();
}

function onCancel() {
  localValue.value = props.modelValue; // Reset to original value
  closeModal();
}

function handleNativeCancel() {
  onCancel();
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
  
  // Keep the dialog positioned from its left edge, not center
  const rect = dialog.value.getBoundingClientRect();
  if (!dialog.value.style.left) {
    // If not already positioned, calculate current left position
    const currentLeft = rect.left;
    dialog.value.style.left = `${currentLeft}px`;
    dialog.value.style.transform = 'none';
  }
}

function stopResize() {
  isResizing.value = false;
  resizeType.value = '';
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

function handleTab(event) {
  event.preventDefault();
  
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  // Insert 2 spaces at the cursor position
  const spaces = '  ';
  localValue.value = localValue.value.substring(0, start) + spaces + localValue.value.substring(end);
  
  // Move cursor to after the inserted spaces
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + spaces.length;
  }, 0);
}

function handleBackspace(event) {
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  // Only handle if no text is selected (cursor position)
  if (start === end && start > 0) {
    const text = localValue.value;
    
    // Find the start of the current line
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const beforeCursor = text.substring(lineStart, start);
    
    // Check if the line before cursor contains only spaces
    if (beforeCursor.match(/^ +$/)) {
      // Check if we can remove 2 spaces (a "tab")
      if (beforeCursor.length >= 2 && beforeCursor.endsWith('  ')) {
        event.preventDefault();
        
        // Remove 2 spaces instead of 1
        localValue.value = text.substring(0, start - 2) + text.substring(start);
        
        // Move cursor back by 2 positions
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start - 2;
        }, 0);
      }
    }
  }
}

function handleKeyDown(event) {
  if (!props.isCodeEditor) return;
  
  if (event.key === 'Tab') {
    handleTab(event);
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    handleBackspace(event);
  }
}

defineExpose({
  showModal, closeModal, toggleModal
})

</script>

<template>
  <div class="TextEntryModalWrapper">
    <button class="EditTextButton" @click="showModal">
      <i class="bi bi-chat-right-text mr-xs"></i>{{ buttonText }}
    </button>
    
    <dialog class="TextEntryModal" ref="dialog" @close="" @cancel="handleNativeCancel">
      <div class="InnerModal">
        <div class="Header">
          <div class="DragHandle" @mousedown="startDrag">
            <i class="bi bi-grip-horizontal"></i>
          </div>
        </div>
        
        <div class="Body">
          <textarea 
            class="ModalTextArea" 
            v-model="localValue"
            :placeholder="placeholder"
            @keydown="handleKeyDown"
          ></textarea>
        </div>
        
        <div class="Footer">
          <button class="CancelButton" @click="onCancel" title="Cancel">
            Cancel
          </button>
          <button class="DoneButton" @click="onDone" title="Done">
            Done
          </button>
        </div>
        
        <!-- Resize handle -->
        <div class="ResizeHandle" @mousedown="startResize($event, 'bottom-right')">
          <i class="bi bi-arrows-angle-expand"></i>
        </div>
      </div>
    </dialog>
  </div>
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
  width: 400px;
  height: 400px;
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

.EditTextButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xxs);
  padding: var(--space-xxs) var(--space-xs);
}

.Footer {
  display: flex;
  justify-content: space-between;
  gap: var(--space-s);
  margin-top: var(--space-s);
}

.CancelButton, .DoneButton {
  background-color: var(--input-bg);
  border: 1px solid var(--medium-color);
  color: var(--input-text);
  cursor: pointer;
  border-radius: var(--border-radius-s);
  padding: var(--space-xs) var(--space-s);
  font-size: var(--f-s);
  transition: all 0.2s ease;
  flex: 1;
}

.CancelButton:hover, .DoneButton:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.DoneButton {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--darkest-color);
}

.DoneButton:hover {
  background-color: var(--primary-color);
  opacity: 0.8;
}

.ModalTextArea {
  width: 100%;
  height: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  font-family: inherit;
  font-size: var(--f-s);
  resize: none;
  overflow-y: auto;
  flex: 1;
}

.ModalTextArea:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
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
