<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt, removeElem } from '../Utils.js'
import { kFilterValueInfo, findFilterDescWithName } from './FilterInfo.js'
import NumberInput from './NumberInput.vue'
import ColorInput from './ColorInput.vue'
import BasicSelector from '../BasicSelector.vue'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  filterFieldName: String,
})
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const filterTypes = kFilterValueInfo.map((elem) => {
  return elem.name;
});

function onChangeFilterType(filterValue, newType) {
  filterValue.changeDesc(findFilterDescWithName(newType));
}

</script>

<template>
  <div class="FilterInput StdInput">
    <div class="Header">
      <div class="InputLabel" v-if="name">{{name}}</div>
      <input class="OptionalToggle" v-model="value.enabled" type="checkbox" name="optionalToggle"/>
    </div>
    <div v-if="value.enabled">
      <div v-for="filterValue in value.filters">
        <div class="Flex EntryHeader">
          <BasicSelector :value="filterValue.type" :options="filterTypes" @change="(newType) => onChangeFilterType(filterValue, newType)" />
          <input class="OptionalToggle" v-model="filterValue.enabled" type="checkbox" name="optionalToggle"/>
          <button class="TertiaryButton" @click="removeElem(value.filters, filterValue)">Del</button>
        </div>
        <div v-if="filterValue.enabled" v-for="(descPart, index) of filterValue.desc.values">
          <div v-if="descPart.type == 'px' || descPart.type == 'percent' || descPart.type == 'angle'">
            <NumberInput v-model="filterValue.values[index]" :name="descPart.name" min="0" />
          </div>
          <div v-else-if="descPart.type == 'color'">
            <ColorInput v-model="filterValue.values[index]" :name="descPart.name" />
          </div>
        </div>
      </div>
      <button class="TertiaryButton" @click="value.addFilter('blur')">Add</button>
    </div>
  </div>
</template>

<style scoped>
.Header {
  display: flex;
  gap: 8px;
}

.OptionalToggle {
  margin-right: 8px;
}

.StdInput {
  margin-right: 16px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

.EntryHeader {
  gap: 8px;
}

</style>
