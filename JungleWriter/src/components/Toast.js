import { reactive } from 'vue'

export class ToastManager {
  constructor() {
    this.toasts = reactive([])
    this.nextId = 1
    this.activeIds = new Set()
  }

  toastSuccess(message, opts = {}) {
    this._addToast('success', message, opts)
  }

  toastError(message, opts = {}) {
    this._addToast('error', message, opts)
  }

  _addToast(type, message, opts) {
    let defaultDuration = type === 'error' ? 10000 : 2000
    const { id, details, duration = defaultDuration } = opts

    // Check for duplicate ID
    if (id && this.activeIds.has(id)) {
      console.log(`Toast with id "${id}" already exists, skipping`)
      return
    }

    const toast = {
      id: id || `toast_${this.nextId++}`,
      type,
      message,
      details,
      timestamp: Date.now()
    }

    // Track active IDs
    if (id) {
      this.activeIds.add(id)
    }

    this.toasts.push(toast)

    // Auto-remove after duration
    setTimeout(() => {
      this.removeToast(toast.id)
    }, duration)

    return toast
  }

  removeToast(toastId) {
    const index = this.toasts.findIndex(t => t.id === toastId)
    if (index !== -1) {
      const toast = this.toasts[index]
      this.toasts.splice(index, 1)
      
      // Remove from active IDs if it was tracked
      if (this.activeIds.has(toast.id)) {
        this.activeIds.delete(toast.id)
      }
    }
  }

  clearAll() {
    this.toasts.splice(0, this.toasts.length)
    this.activeIds.clear()
  }
}

// Global toast manager instance
export const gToastManager = new ToastManager()
