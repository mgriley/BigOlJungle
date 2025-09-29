<script setup>
import { ref, computed } from 'vue'
import ImageChooserModal from '../ImageChooserModal.vue'
import { trimText } from 'Shared/SharedUtils.js'

const props = defineProps({
  modelValue: String,
  name: {
    type: String,
    default: 'Choose image'
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
    <button @click="onStartChooseImg" class="mb-xs">
      <i class="bi bi-image mr-xs"></i>
      {{ value ? trimText(value, 20) : name }}
    </button>
    <ImageChooserModal ref="imgChooser" v-model="value" />
  </div>
</template>

<style scoped>
</style>
