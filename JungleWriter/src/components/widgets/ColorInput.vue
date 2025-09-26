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
    if (props.showAlpha && typeof props.modelValue === 'string') {
      // Extract hex color from rgba/hsla string if needed
      const match = props.modelValue.match(/^#[0-9A-Fa-f]{6}/) || props.modelValue.match(/^#[0-9A-Fa-f]{3}/);
      return match ? match[0] : props.modelValue;
    }
    return props.modelValue
  },
  set(value) {
    if (props.showAlpha) {
      // Combine color with current alpha
      const alpha = alphaValue.value;
      const rgbaColor = hexToRgba(value, alpha);
      emit('update:modelValue', rgbaColor);
    } else {
      emit('update:modelValue', value);
    }
  }
})

const alphaValue = computed({
  get() {
    if (props.showAlpha && typeof props.modelValue === 'string') {
      // Extract alpha from rgba string
      const rgbaMatch = props.modelValue.match(/rgba?\([\d\s,]+,\s*([\d.]+)\)/);
      if (rgbaMatch) {
        return parseFloat(rgbaMatch[1]);
      }
      // Extract alpha from hsla string
      const hslaMatch = props.modelValue.match(/hsla?\([\d\s,%]+,\s*([\d.]+)\)/);
      if (hslaMatch) {
        return parseFloat(hslaMatch[1]);
      }
    }
    return 1.0; // Default to fully opaque
  },
  set(alpha) {
    if (props.showAlpha) {
      const color = value.value;
      const rgbaColor = hexToRgba(color, alpha);
      emit('update:modelValue', rgbaColor);
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
      emit('update:modelValue', props.defaultValue);
    } else {
      emit('update:modelValue', null);
    }
  }
})

const labelWidth = computed(() => {
  return props.labelWidth || 'auto';
})

function hexToRgba(hex, alpha) {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
