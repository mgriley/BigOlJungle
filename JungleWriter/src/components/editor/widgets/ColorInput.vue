<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import { ColorPicker } from 'vue-accessible-color-picker'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
})
const emit = defineEmits(['update:modelValue'])

let dialog = ref(null);

function showModal() {
  dialog.value.showModal();
}

function closeModal() {
  dialog.value.close();
}

function toggleModal() {
  if (!dialog.value.open) {
    showModal();
  } else {
    closeModal();
  }
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

function onUpdateColor(evt) {
  value.value = evt.cssColor;
}

</script>

<template>
  <div class="ColorInput StdInput">
    <div class="InputLabel" v-if="name">{{name}}</div>
    <div class="Parent">
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <div class="InputChild CurColorBox Flex" :style="{'background-color': value}" @click="toggleModal"></div>
      <!-- <input class="BasicTextInput InputChild" type="color" v-model="value"> -->
    </div>
  </div>
  <dialog class="ColorDialog" ref="dialog" @close="" @cancel="">
    <ColorPicker :color="value" @color-change="onUpdateColor" />
  </dialog>
</template>

<style>
@import url('vue-accessible-color-picker/styles');
</style>

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

.CurColorBox {
  width: var(--space-m);
  height: var(--space-s);
}

.ColorDialog {
}

</style>
