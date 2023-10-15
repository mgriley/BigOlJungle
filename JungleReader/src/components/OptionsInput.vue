<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

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
<template v-if="options.length == 0">
  <div>
    <button @click="addOption" class="SmallButton Block">Add</button>
  </div>
</template>
<template v-else>
  <div class="OptionsContainer">
    <div v-for="(element, index) in options" class="OptionsEntry">
      <input v-if="hasKeys" v-model="element.key" class="KeyInput BasicTextInput" type="text" size="1">
      <input v-model="element.value" class="ValueInput BasicTextInput" type="text" size="1">
      <button class="DeleteBtn SmallButton" @click="deleteOption(index)">Delete</button>
    </div>
    <button @click="addOption" class="SmallButton">Add</button>
  </div>
</template>
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
  /* The align-items baseline causes issues on mobile */
  /* align-items: baseline; */
  gap: 4px;
  margin-bottom: 4px;
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

.SmallButton {
  margin: 0;
}

</style>
