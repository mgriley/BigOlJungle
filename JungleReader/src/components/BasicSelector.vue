<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  value: [Object, String],
  options: Array,
  labelKey: [String],
  valueKey: [String],
});
const emit = defineEmits(['change'])

function getLabel(obj) {
  if (props.labelKey) {
    return obj[props.labelKey];
  } else {
    return obj;
  }
}

function getValue(obj) {
  if (props.valueKey) {
    return obj[props.valueKey];
  } else {
    return obj;
  }
}

let curValue = computed(() => {
  return getValue(props.value);
})

function onChange(changeEvt) {
  let chosenValue = changeEvt.target.value;
  //console.log("NewVal: "+chosenValue);

  let chosenObj = null;
  for (const item of props.options) {
    if (getValue(item) == chosenValue) {
      chosenObj = item;
      break;
    }
  }
  emit('change', chosenObj);
}

</script>

<template>
  <div class="BasicSelector">
    <select :model="curValue" @change="onChange">
      <option v-for="option in options" :key="getValue(option)" :value="getValue(option)">
        {{ getLabel(option) }}
      </option>
    </select>
  </div>
</template>

<style scoped>
</style>
