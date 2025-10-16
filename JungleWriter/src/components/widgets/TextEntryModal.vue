<script setup>
import { ref, onMounted, reactive, computed, watch } from 'vue'
import { makeDraggableExt } from '../DragUtils.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Edit Text'
  },
  title: {
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

const textareaFontFamily = computed(() => {
  return props.isCodeEditor ? 'monospace' : 'inherit'
})

const modalStyle = computed(() => {
  return {
    width: width.value + 'px',
    height: height.value + 'px',
    left: posX.value + 'px',
    top: posY.value + 'px',
    margin: '0',
    transform: 'none',
  };
})

// Watch for changes to localValue and emit updates if updateWhileTyping is enabled
watch(localValue, (newValue) => {
  if (props.updateWhileTyping) {
    emit('update:modelValue', newValue)
  }
})

let dialog = ref(null);
let headerRef = ref(null);
let resizeHandleRef = ref(null);

// Position and size variables
let posX = ref(0);
let posY = ref(0);
let width = ref(600);
let height = ref(600);

function showModal() {
  localValue.value = props.modelValue;
  dialog.value.showModal();
}

function closeModal() {
  console.log("Closing modal!");
  emit('update:modelValue', localValue.value);
  dialog.value.close();
}

function toggleModal() {
  if (!dialog.value.open) {
    showModal();
  } else {
    closeModal();
  }
}

function noOp() {
  // Intentionally empty to prevent unwanted behaviors
  // Note - need this because otherwise the makeDraggableExt on the header
  // eats pointerdown, pointerup and never triggers @click on the close button!
  //console.log("No-op function called");
}

function handleNativeCancel() {
  emit('update:modelValue', localValue.value);
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

function handleEnter(event) {
  event.preventDefault();
  
  const textarea = event.target;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const text = localValue.value;
  
  // Find the start of the current line
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const currentLine = text.substring(lineStart, start);
  
  // Extract leading spaces from current line
  const indentMatch = currentLine.match(/^( *)/);
  const indent = indentMatch ? indentMatch[1] : '';
  
  // Insert newline followed by matching indentation
  const newContent = '\n' + indent;
  localValue.value = text.substring(0, start) + newContent + text.substring(end);
  
  // Move cursor to after the inserted content
  setTimeout(() => {
    textarea.selectionStart = textarea.selectionEnd = start + newContent.length;
  }, 0);
}

function handleKeyDown(event) {
  if (!props.isCodeEditor) return;
  
  if (event.key === 'Tab') {
    handleTab(event);
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    handleBackspace(event);
  } else if (event.key === 'Enter') {
    handleEnter(event);
  }
}

onMounted(() => {
  // Calculate default centered position
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  posX.value = Math.max(0, (viewportWidth - width.value) / 2);
  posY.value = Math.max(0, (viewportHeight - height.value) / 2);
  
  // Set up dragging using DragUtils
  if (headerRef.value) {
    makeDraggableExt(headerRef.value, {
      onStart: (startX, startY) => {
        // Store the initial offset between mouse and dialog position
        const rect = dialog.value.getBoundingClientRect();
        headerRef.value._dragOffset = {
          x: startX - rect.left,
          y: startY - rect.top
        };
      },
      onUpdate: (startX, startY, curX, curY) => {
        const newX = curX - headerRef.value._dragOffset.x;
        const newY = curY - headerRef.value._dragOffset.y;
        
        // Constrain to viewport bounds
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const modalWidth = width.value;
        const modalHeight = height.value;
        
        // Ensure the modal stays within viewport bounds
        const constrainedX = Math.max(0, Math.min(newX, viewportWidth - modalWidth));
        const constrainedY = Math.max(0, Math.min(newY, viewportHeight - modalHeight));
        
        posX.value = constrainedX;
        posY.value = constrainedY;
      }
    });
  }
  
  // Set up resizing using DragUtils
  if (resizeHandleRef.value) {
    makeDraggableExt(resizeHandleRef.value, {
      onStart: (startX, startY) => {
        // Store initial size for resize calculations
        resizeHandleRef.value._initialSize = {
          width: width.value,
          height: height.value
        };
      },
      onUpdate: (startX, startY, curX, curY) => {
        const deltaX = curX - startX;
        const deltaY = curY - startY;
        
        const initialSize = resizeHandleRef.value._initialSize;
        width.value = Math.max(300, initialSize.width + deltaX);
        height.value = Math.max(200, initialSize.height + deltaY);
      }
    });
  }
})

defineExpose({
  showModal, closeModal, toggleModal
})

</script>

<template>
  <div class="TextEntryModalWrapper">
    <button class="EditTextButton" @click="showModal">
      <i class="bi bi-chat-right-text mr-xs"></i>{{ buttonText }}
    </button>
    
    <dialog class="TextEntryModal" ref="dialog" :style="modalStyle" @close="" @cancel="handleNativeCancel">
      <div class="InnerModal">
        <div class="Header" ref="headerRef">
          <div class="Title">{{ title }}</div>
          <button class="CloseButton" @pointerdown.stop="noOp()" @click.stop="closeModal" title="Close">
            <i class="bi bi-x"></i>
          </button>
        </div>
        
        <div class="Body">
          <textarea 
            class="ModalTextArea" 
            v-model="localValue"
            :placeholder="placeholder"
            @keydown="handleKeyDown"
            :style="{ fontFamily: textareaFontFamily }"
          ></textarea>
        </div>
        
        <!-- Resize handle -->
        <div class="ResizeHandle" ref="resizeHandleRef">
          <i class="bi bi-arrows-angle-expand"></i>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>

.TextEntryModal {
  border: 1px solid white;
  padding: 0;
  min-width: 300px;
  max-width: 90%;
  position: fixed;
}

.TextEntryModal::backdrop {
  background: transparent;
}

.InnerModal {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.Header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid white;
  background-color: blue;
  padding: var(--space-xs);
  cursor: move;
  user-select: none;
}

.Title {
  flex: 1;
  text-align: center;
  font-weight: 500;
  color: var(--popup-text);
  user-select: none;
}

.CloseButton {
  border: none;
  background: red;
  color: white;
  cursor: pointer;
  padding: 2px;
  min-width: var(--space-xl);
  border-radius: var(--border-radius-s);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  font-size: 18px;
}

.CloseButton:hover {
  color: var(--popup-text);
  background-color: var(--medium-color);
}

.EditTextButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xxs);
  padding: var(--space-xxs) var(--space-xs);
}

.Body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ModalTextArea {
  width: 100%;
  height: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--medium-color);
  border-radius: 0;
  background-color: blue;
  color: white;
  /*color: var(--input-text);*/
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
