<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function handleClickOutside(event) {
  if (!event.target.closest('.DropdownSelector')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="DropdownSelector">
    <div class="DropdownButton" @click="toggleDropdown">
      <div class="ButtonContent">
        <i v-if="currentItem?.icon" :class="currentItem.icon" class="ItemIcon"></i>
        <span>{{ currentItemName }}</span>
      </div>
      <i v-if="showIcon" :class="icon"></i>
    </div>
    <div class="DropdownMenu" :class="{IsOpen: isDropdownOpen}" :style="{minWidth: minWidth}">
      <div v-for="item in items" :key="item.name"
        @click="selectItem(item)"
        class="DropdownItem"
        :class="{IsActive: currentItem === item}">
        <i v-if="item.icon" :class="item.icon" class="ItemIcon mr-xs"></i>
        <span>{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.DropdownSelector {
  position: relative;
  display: inline-block;
  width: 100%;
  user-select: none;
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
}

.ButtonContent {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
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
  background-color: blue;
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: none;
}

.DropdownMenu.IsOpen {
  display: block;
}

.DropdownItem {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-s);
  cursor: pointer;
  font-size: var(--text-size-sm);
}

.ItemIcon {
  width: 16px;
  flex-shrink: 0;
}

.DropdownItem:hover {
  background-color: darkblue;
}

.DropdownItem.IsActive {
  background-color: orangered;
  color: white;
}

.DropdownItem.IsActive:hover {
  background-color: orangered;
}
</style>
