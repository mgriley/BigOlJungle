<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['modelValue', 'name'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>

<template>
  <div class="TextAlignParent">
    <input type="radio" name="editList" id="left" value="left" v-model="value"/>
    <label for="left">Left</label>

    <input type="radio" name="editList" id="center" value="center" v-model="value"/>
    <label for="center">Center</label>

    <input type="radio" name="editList" id="right" value="right" v-model="value"/>
    <label for="right">Right</label>
  </div>
</template>

<style scoped>
.TextAlignParent input {
  margin-right: 5px;
}
.TextAlignParent label {
  margin-right: 10px;
}
</style>
