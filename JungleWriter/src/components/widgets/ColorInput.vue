<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps({
  color: [String, Number, Object],
  name: String,
  labelWidth: {
    type: String,
    default: null
  },
  showAlpha: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['change'])

let showDialog = ref(false);

function toggleModal() {
  showDialog.value = !showDialog.value;
}

const value = computed({
  get() {
    return props.color?.color || '#ffffff'
  },
  set(color) {
    if (props.color) {
      props.color.color = color;
      emit('change', props.color);
    }
  }
})

const alphaValue = computed({
  get() {
    return props.color?.alpha || 1.0
  },
  set(alpha) {
    if (props.color) {
      props.color.alpha = alpha;
      emit('change', props.color);
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
      <input class="BasicTextInput ColorPicker" type="color" v-model="value">
      <input v-if="showAlpha" class="AlphaSlider" type="range" min="0" max="1" step="0.01" v-model="alphaValue" title="Alpha">
      <!-- <div class="InputChild CurColorBox Flex" :style="{'background-color': value}" @click="toggleModal"></div> -->
    </div>
  </div>
  <!--
  <div v-if="showDialog" class="ColorDialog">
    <ColorPicker :color="value" @color-change="onUpdateColor" />
  </div>
  !-->
</template>

<style scoped>
.Parent {
  display: flex;
  align-items: center;
}

.LeftLabel {
  margin-right: 4px;
  margin-bottom: 0;
  white-space: nowrap;
}


.ColorPicker {
  /*display: inline-block;*/
  flex: 1;
  min-width: 60px;
}

.AlphaSlider {
  margin-left: 8px;
  width: 80px;
  max-width: 80px;
  height: 24px;
  background: linear-gradient(to right, 
    rgba(0,0,0,0) 0%, 
    rgba(0,0,0,1) 100%);
  border-radius: var(--border-radius-small);
  outline: none;
  cursor: pointer;
}

.AlphaSlider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--white-color);
  border: 2px solid var(--medium-color);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.AlphaSlider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--white-color);
  border: 2px solid var(--medium-color);
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
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
