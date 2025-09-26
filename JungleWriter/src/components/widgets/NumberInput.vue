<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  min: {
    type: Number,
    default: null,
  },
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
  labelLeft: {
    type: Boolean,
    default: false
  },
  labelWidth: {
    type: String,
    default: null
  },
  increment: {
    type: Number,
    default: 1
  }
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

const leftLabelWidth = computed(() => {
  if (props.labelWidth) {
    return props.labelWidth;
  }
  return `${props.name.length + 0.5}ch`;
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

function setupDragBall(elmnt) {
  var startVal = null;

  makeDraggableExt(elmnt, {
    onStart: () => {
      startVal = Number(value.value) || 0;
      document.body.style.cursor = 'move';
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      let newVal = null;
      let incrementAmount = (diffY / 5.0) * props.increment;
      if (props.min !== null) {
        let minVal = Number(props.min) || 0;
        newVal = Math.max(minVal, startVal - incrementAmount);
      } else {
        newVal = startVal - incrementAmount;
      }
      // Round to appropriate precision based on increment
      if (props.increment < 1) {
        let decimalPlaces = Math.max(0, -Math.floor(Math.log10(props.increment)));
        newVal = Math.round(newVal * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
      } else {
        newVal = Math.round(newVal);
      }
      /*console.log("New value: " + newVal);*/
      value.value = newVal;
    },
    onEnd: () => {
      document.body.style.cursor = '';
    }
  })
}

let dragBall = ref(null);

onMounted(() => {
  setupDragBall(dragBall.value);
})

</script>

<template>
  <div class="NumberInput" :class="{ 'LabelLeft': labelLeft }">
    <div class="InputLabel TopLabel" v-if="name && !labelLeft">{{name}}</div>
    <div class="Flex">
      <div class="InputLabel LeftLabel" v-if="name && labelLeft" :style="{ width: leftLabelWidth, minWidth: leftLabelWidth }">{{name}}</div>
      <input v-if="isOptional" class="EditorInput OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="EditorInput InputChild" type="number" v-model="value" :min="min" :step="increment">
      <div class="DragBall" ref="dragBall" title="Drag up and down"><i class="bi bi-arrow-down-up ml-xs"></i></div>
    </div>
  </div>
</template>

<style scoped>
.NumberInput {
  flex: 1;
  margin-bottom: var(--space-xs);
}

.OptionalToggle {
  margin-right: 8px;
}

.TopLabel {
  font-size: var(--f-s);
  margin-bottom: var(--space-xxs);
}

.DragBall {
  cursor: move;
  font-weight: var(--bold-weight);
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}

.LabelLeft .Parent {
  align-items: center;
}

.LeftLabel {
  margin-right: 8px;
  margin-bottom: 0;
  white-space: nowrap;
}

</style>
