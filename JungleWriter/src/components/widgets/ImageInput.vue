<script setup>
import { ref, computed } from 'vue'
import ImageChooserModal from '../ImageChooserModal.vue'
import { trimText } from 'Shared/SharedUtils.js'

const props = defineProps({
  modelValue: String,
  name: {
    type: String,
    default: 'Choose image'
  },
  fileFilter: {
    type: String,
    default: 'image' // 'image' or 'png'
  }
})

const emit = defineEmits(['update:modelValue'])

const imgChooser = ref(null)

const value = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:modelValue', newValue)
  }
})

function onStartChooseImg() {
  imgChooser.value.showModal()
}
</script>

<template>
  <div>
    <div v-if="name" class="InputLabel">{{ name }}</div>
    <button @click="onStartChooseImg" class="ImageInputButton mb-xs">
      <i class="bi bi-image mr-xs"></i>
      <span class="ButtonText">{{ value ? trimText(value, 20) : 'Choose image' }}</span>
    </button>
    <ImageChooserModal ref="imgChooser" v-model="value" :fileFilter="fileFilter" />
  </div>
</template>

<style scoped>
.InputLabel {
  font-size: var(--f-s);
  margin-bottom: var(--space-xxs);
}

.ImageInputButton {
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
}

.ButtonText {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
