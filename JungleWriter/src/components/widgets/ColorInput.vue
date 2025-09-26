<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
// import { ColorPicker } from 'vue-accessible-color-picker'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
  labelWidth: {
    type: String,
    default: null
  }
})
const emit = defineEmits(['update:modelValue'])

let showDialog = ref(false);

function toggleModal() {
  showDialog.value = !showDialog.value;
}

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

const labelWidth = computed(() => {
  return props.labelWidth || 'auto';
})

function onUpdateColor(evt) {
  value.value = evt.cssColor;
}

</script>

<template>
  <div class="ColorInput StdInput">
    <div class="Parent">
      <div class="InputLabel LeftLabel" v-if="name" :style="{ width: labelWidth }">{{name}}</div>
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="BasicTextInput InputChild" type="color" v-model="value">
      <!-- <div class="InputChild CurColorBox Flex" :style="{'background-color': value}" @click="toggleModal"></div> -->
    </div>
  </div>
  <!--
  <div v-if="showDialog" class="ColorDialog">
    <ColorPicker :color="value" @color-change="onUpdateColor" />
  </div>
  !-->
</template>

<style>
@import url('vue-accessible-color-picker/styles');

/* See: https://github.com/kleinfreund/vue-accessible-color-picker#usage */
:root {
  /* --vacp-color-background-input: red; */
  --vacp-color-background: var(--popup-bg);
  --vacp-color-border: white;
  --vacp-width-border: 1px;
}
</style>

<style scoped>
.Parent {
  display: flex;
  align-items: center;
}

.LeftLabel {
  margin-right: 8px;
  margin-bottom: 0;
  white-space: nowrap;
}

.OptionalToggle {
  margin-right: 8px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

.CurColorBox {
  width: var(--space-m);
  height: var(--space-s);
}

.ColorDialog {
  position: absolute;
  z-index: 9;
  background-color: var(--popup-bg);
  /* min-width: 300px; */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.33);
}

</style>
