<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import draggable from 'vuedraggable'

const props = defineProps({
  options: Object,
  hasKeys: {
    default: true
  }
})

function deleteOption(index) {
  props.options.splice(index, 1);
}

function addOption() {
  let obj = props.hasKeys ? {key: '', value: ''} : {value: ''};
  props.options.push(obj);
}

</script>

<template>
  <div class="OptionsContainer">
    <div v-for="(element, index) in options" class="OptionsEntry">
      <input v-if="hasKeys" v-model="element.key" class="KeyInput BasicTextInput" type="text">
      <input v-model="element.value" class="ValueInput BasicTextInput" type="text">
      <button class="DeleteBtn SmallButton" @click="deleteOption(index)">Delete</button>
    </div>
    <button @click="addOption" class="SmallButton">Add</button>
  </div>
</template>

<style scoped>
.OptionsContainer {
  padding: 10px;
  border: 2px dashed var(--main-text);
  max-width: 600px;
}

.OptionsEntry {
  display: flex;
  flex-flow: row wrap;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 5px;
}

.OptionsEntry input {
  padding: 2px;

  /* Needed to get flex resize working */
  min-width: 0px;
  max-width: 30ch;
}

.KeyInput {
  flex: 1 60px;
}

.ValueInput {
  flex: 1 60px;
}

.DeleteBtn {
}

</style>
