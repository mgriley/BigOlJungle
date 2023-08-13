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
  <div class="OptionsContainer">
    <div v-for="(element, index) in options" class="OptionsEntry">
      <input v-model="element.key" class="Block KeyInput BasicTextInput">
      <input v-model="element.value" class="Block ValueInput BasicTextInput">
      <button class="DeleteBtn SmallButton" @click="deleteOption(index)">Delete</button>
    </div>
    <button @click="addOption" class="SmallButton">Add</button>
  </div>
</template>

<style scoped>
.OptionsContainer {
  padding: 10px;
  border: 2px dashed var(--main-text);
}

.OptionsEntry {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 5px;
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

.SmallButton {
  border: none;
  padding: 0px;
  margin: 0px;
  min-width: 20px;
  line-height: 1rem;
}
</style>
