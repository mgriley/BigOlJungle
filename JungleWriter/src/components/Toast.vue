<script setup>
import { gToastManager } from './Toast.js'

function removeToast(toastId) {
  gToastManager.removeToast(toastId)
}

function toggleDetails(toast) {
  toast.showDetails = !toast.showDetails
}
</script>

<template>
  <div class="ToastContainer">
    <div 
      v-for="toast in gToastManager.toasts" 
      :key="toast.id"
      class="Toast"
      :class="[`Toast--${toast.type}`]"
    >
      <div class="Toast__header">
        <div class="Toast__icon mr-xs">
          <i v-if="toast.type === 'success'" class="bi bi-check-circle-fill"></i>
          <i v-else-if="toast.type === 'error'" class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <div class="Toast__message">{{ toast.message }}</div>
        <button 
          class="Toast__close-btn" 
          @click="removeToast(toast.id)"
          title="Close"
        >
          <i class="bi bi-x"></i>
        </button>
      </div>
      
      <div v-if="toast.details" class="Toast__details-toggle">
        <button 
          class="Toast__details-btn"
          @click="toggleDetails(toast)"
        >
          <i class="bi bi-chevron-right" :class="{ 'rotated': toast.showDetails }"></i>
          Details
        </button>
      </div>
      
      <div v-if="toast.details && toast.showDetails" class="Toast__details">
        <pre>{{ toast.details }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ToastContainer {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  max-width: 400px;
}

.Toast {
  background: white;
  color: black;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
}

.Toast--success {
  border-left: 4px solid #22c55e;
}

.Toast--error {
  border-left: 4px solid #ef4444;
}

.Toast__header {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-s);
}

.Toast__icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.Toast--success .Toast__icon {
  color: #22c55e;
}

.Toast--error .Toast__icon {
  color: #ef4444;
}

.Toast__message {
  flex: 1;
  font-size: var(--f-s);
  line-height: 1.4;
  word-wrap: break-word;
}

.Toast__close-btn {
  flex-shrink: 0;
  align-self: flex-start;
  background: none;
  border: none;
  padding: 0px;
  font-size: var(--f-xl) !important;
  min-width: 0px;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
  border-radius: 2px;
}

.Toast__close-btn:hover {
  opacity: 1;
  background: var(--hover-color);
}

.Toast__details-toggle {
  padding: 0 var(--space-s) var(--space-xs) var(--space-s);
}

.Toast__details-btn {
  background: none;
  border: none;
  padding: var(--space-xs);
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.8;
  border-radius: 2px;
  font-size: var(--f-xs);
  display: flex;
  align-items: center;
  gap: var(--space-xxs);
}

.Toast__details-btn:hover {
  opacity: 1;
  background: var(--hover-color);
}

.Toast__details-btn i {
  transition: transform 0.2s ease;
}

.Toast__details-btn i.rotated {
  transform: rotate(90deg);
}

.Toast__details {
  border-top: 1px solid var(--border-color);
  padding: var(--space-s);
  background: var(--subtle-bg-color);
  max-height: 200px;
  overflow-y: auto;
}

.Toast__details pre {
  margin: 0;
  font-size: var(--f-xs);
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--muted-text-color);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
