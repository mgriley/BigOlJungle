<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import ModalSelector from '../ModalSelector.vue'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
})
const emit = defineEmits(['update:modelValue'])

let fontPickerModal = ref(null);

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

let fontOptions = computed(() => {
  let fonts = [
    {name: 'sans-serif', type: 'sans-serif'},
    {name: 'Arial', type: 'sans-serif'},
    {name: 'Arial Black', type: 'sans-serif'},
    {name: 'Comic Sans MS', type: 'sans-serif'},
    {name: 'Helvetica', type: 'sans-serif'},
    {name: 'Impact', type: 'sans-serif'},
    {name: 'Tahoma', type: 'sans-serif'},
    {name: 'Trebuchet MS', type: 'sans-serif'},
    {name: 'Verdana', type: 'sans-serif'},

    {name: 'serif', type: 'serif'},
    {name: 'Garamond', type: 'serif'},
    {name: 'Georgia', type: 'serif'},
    {name: 'Palatino', type: 'serif'},
    {name: 'Times New Roman', type: 'serif'},

    {name: 'monospace', type: 'monospace'},
    {name: 'Courier New', type: 'monospace'},

    {name: 'cursive', type: 'cursive'},
    {name: 'Brush Script MT', type: 'cursive'},
  ];
  let bgColorMap = {
    'serif': 'red',
    'sans-serif': 'blue',
    'monospace': 'orange',
    'cursive': 'purple',
  }
  let fontData = fonts.map((font) => {
    return {
      name: font.name,
      style: {
        'font-family': font.name,
        'background-color': bgColorMap[font.type],
      }
    }
  });
  return fontData;
})

function startPickFont(clickEvt) {
  fontPickerModal.value.toggleModal(clickEvt);  
}

function onPickFont(newFont) {
  value.value = newFont.name;
}

</script>

<template>
  <div class="FontInput StdInput">
    <div class="Parent">
      <div class="InputLabel" v-if="name">{{name}}</div>
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <!-- <input class="BasicTextInput InputChild" type="text" v-model="value"> -->
      <button class="FontButton SmallButton" :style="{'font-family': value}" @click="startPickFont">{{ value || 'Default' }}</button>
      <ModalSelector ref="fontPickerModal" :options="fontOptions" @choose="onPickFont"/>
    </div>
  </div>
</template>

<style scoped>
.Parent {
  display: flex;
  align-items: center;
}

.InputLabel {
  margin-right: 8px;
  min-width: fit-content;
}

.OptionalToggle {
  margin-right: 8px;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

.FontButton {
  font-weight: normal;
}

#OptionA {
  font-family: serif;
}

</style>
