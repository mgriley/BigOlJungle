<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  currentItem: {
    type: Object,
    default: null
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'bi-chevron-down'
  },
  minWidth: {
    type: String,
    default: '200px'
  }
})

const emit = defineEmits(['select'])

const isDropdownOpen = ref(false)

const currentItemName = computed(() => {
  return props.currentItem?.name || props.placeholder
})

function selectItem(item) {
  emit('select', item)
  isDropdownOpen.value = false
}

function handleMouseEnter() {
  isDropdownOpen.value = true
}

function handleMouseLeave() {
  isDropdownOpen.value = false
}
</script>

<template>
  <div class="DropdownSelector" @mouseleave="handleMouseLeave">
    <div class="DropdownButton" @mouseenter="handleMouseEnter">
      <span>{{ currentItemName }}</span>
      <i v-if="showIcon" :class="icon"></i>
    </div>
    <div class="DropdownMenu" :class="{IsOpen: isDropdownOpen}" :style="{minWidth: minWidth}">
      <div v-for="item in items" :key="item.name"
        @click="selectItem(item)"
        class="DropdownItem"
        :class="{IsActive: currentItem === item}">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.DropdownSelector {
  position: relative;
  display: inline-block;
  width: 100%;
}

.DropdownButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-s);
  background-color: var(--main-bg);
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--text-size-sm);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.DropdownButton:hover {
  background-color: var(--link-hover-bg);
  border-color: var(--primary-color);
}

.DropdownMenu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--main-bg);
  border: 1px solid var(--light-color);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
}

.DropdownMenu.IsOpen {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.DropdownItem {
  padding: var(--space-xs) var(--space-s);
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: var(--text-size-sm);
}

.DropdownItem:hover {
  background-color: var(--link-hover-bg);
}

.DropdownItem.IsActive {
  background-color: var(--primary-color);
  color: white;
}

.DropdownItem.IsActive:hover {
  background-color: var(--primary-color);
}
</style>
