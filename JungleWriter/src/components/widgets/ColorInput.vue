<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'
import { ColorInput as ColorInputClass } from './ColorInput.js'
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
  },
  showAlpha: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['update:modelValue'])

let showDialog = ref(false);

function toggleModal() {
  showDialog.value = !showDialog.value;
}

const value = computed({
  get() {
    return props.modelValue?.color || '#ffffff'
  },
  set(color) {
    if (props.modelValue) {
      props.modelValue.color = color;
      emit('update:modelValue', props.modelValue);
    }
  }
})

const alphaValue = computed({
  get() {
    return props.modelValue?.alpha || 1.0
  },
  set(alpha) {
    if (props.modelValue) {
      props.modelValue.alpha = alpha;
      emit('update:modelValue', props.modelValue);
    }
  }
})

const optionalValue = computed({
  get() {
    return props.modelValue !== null;
  },
  set(value) {
    if (value) {
      //console.log("DefaultValue: "+props.defaultValue);
      emit('update:modelValue', props.defaultValue || new ColorInputClass());
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
      <div class="InputLabel LeftLabel" v-if="name" :style="{ width: labelWidth, minWidth: labelWidth }">{{name}}</div>
      <input v-if="isOptional" class="OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="BasicTextInput InputChild" type="color" v-model="value">
      <input v-if="showAlpha" class="BasicTextInput AlphaInput" type="range" min="0" max="1" step="0.01" v-model="alphaValue" title="Alpha">
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

.AlphaInput {
  flex: 0 0 60px;
  margin-left: 8px;
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
