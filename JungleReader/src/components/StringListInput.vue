<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  options: Array
})

function deleteOption(index) {
  props.options.splice(index, 1);
}

function addOption() {
  props.options.push("");
}

</script>

<template>
  <div class="StringListContainer">
    <div v-for="(element, index) in options" class="OptionsEntry">
      <input v-model="element" class="Block ValueInput BasicTextInput">
      <button class="DeleteBtn SmallButton" @click="deleteOption(index)">Delete</button>
    </div>
    <button @click="addOption" class="SmallButton">Add</button>
  </div>
</template>

<style scoped>
.StringListContainer {
  padding: 10px;
  border: 2px dashed var(--main-text);
}

.OptionsEntry {
  margin-bottom: 5px;
}

.OptionsEntry input {
  padding: 2px;
  line-height: 1rem;
}

.KeyInput {
  width: 150px;
}

.ValueInput {
  width: 200px;
}

</style>
