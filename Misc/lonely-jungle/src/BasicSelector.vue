<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  value: [Object, String],
  // May be [String] or [{label, value}, ...]
  options: Array,
});
const emit = defineEmits(['change'])

function getLabel(obj) {
  if (typeof obj == 'object') {
    return obj['label'];
  } else {
    return obj;
  }
}

function getValue(obj) {
  if (typeof obj == 'object') {
    return obj['value'];
  } else {
    return obj;
  }
}

let isValidOption = computed(() => {
  for (const option of props.options) {
    if (props.value == getValue(option)) {
      return true;
    }
  }
  return false;
});

function onChange(changeEvt) {
  let chosenValue = changeEvt.target.value;
  //console.log("NewVal: "+chosenValue);
  emit('change', chosenValue);
}

</script>

<template>
  <div class="BasicSelector">
    <select v-if="options.length > 0" :value="value" @change="onChange" class="Select" :class="{IsInvalid: !isValidOption}">
      <!-- <option disabled value="">Please Select</option> -->
      <!-- <option disabled value="">Current: {{curValue}}</option> -->
      <option v-if="!isValidOption" disabled :value="value">
        Invalid Value
      </option>
      <option v-for="option in options" :key="getValue(option)" :value="getValue(option)">
        {{ getLabel(option) }}
      </option>
    </select>
    <p v-else>NA</p>
  </div>
</template>

<style scoped>
.Select {
  width: 100%;
}

.Select.IsInvalid {
  border: 2px solid red;
}
</style>
