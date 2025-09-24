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
  <div class="StdInput TextAlignParent">
    <div class="InputLabel">Align</div>
    <div class="BtnRow">
      <input type="radio" name="editList" id="left" value="left" v-model="value"/>
      <label for="left">Left</label>

      <input type="radio" name="editList" id="center" value="center" v-model="value"/>
      <label for="center">Center</label>

      <input type="radio" name="editList" id="right" value="right" v-model="value"/>
      <label for="right">Right</label>
    </div>
  </div>
</template>

<style scoped>
.TextAlignParent input {
  margin-right: 4px;
}

.TextAlignParent label {
  margin-right: 8px;
}

.BtnRow {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
}
</style>
