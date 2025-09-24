<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import BasicSelector from '../BasicSelector.vue'

const props = defineProps({
  modelValue: [String, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Object],
})
const emit = defineEmits(['update:modelValue'])

let fileOptions = ref(null);
let changeEvtHandle = null;

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const optionalValue = computed({
  get() {
    return props.modelValue !== null;
  },
  set(value) {
    if (value) {
      //console.log("DefaultValue: "+props.defaultValue);
      emit('update:modelValue', props.defaultValue);
    } else {
      emit('update:modelValue', null);
    }
  }
})

async function updateFileOptions() {
  console.log("FileNameInput updating options");
  let children = await gApp.site.siteDir.getSortedChildren();
  fileOptions.value = children.map((elem) => {
    return elem.getName();
  });
}

function onValueChanged(newVal) {
  value.value = newVal;
}

onMounted(() => {
  changeEvtHandle = gApp.fileStorage.onChangeEvt.addListener(updateFileOptions);
  updateFileOptions();
})

onUnmounted(() => {
  gApp.fileStorage.onChangeEvt.removeListener(changeEvtHandle);
});

</script>

<template>
  <div class="FileNameInput StdInput">
    <div class="InputLabel" v-if="name">{{name}}</div>
    <div class="Parent">
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <BasicSelector :value="value" :options="fileOptions" @change="onValueChanged" />
    </div>
  </div>
</template>

<style scoped>
.Parent {
  display: flex;
}

.OptionalToggle {
  margin-right: 8px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

</style>
