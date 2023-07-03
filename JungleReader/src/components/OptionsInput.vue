<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  options: Object
})

function deleteOption(index) {
  props.options.splice(index, 1);
}

function addOption() {
  props.options.push({key: '', value: ''});
}

</script>

<template>
  <div>
    <div v-for="(element, index) in options" class="OptionsEntry">
      <input v-model="element.key" class="Block KeyInput">
      <input v-model="element.value" class="Block ValueInput">
      <button @click="deleteOption(index)">X</button>
    </div>
    <button @click="addOption">Add</button>
  </div>
</template>

<style scoped>
.OptionsEntry {
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
}

.KeyInput {
  width: 150px;
}

.ValueInput {
  width: 200px;
}
</style>
