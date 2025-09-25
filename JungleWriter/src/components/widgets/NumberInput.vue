<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps({
  modelValue: [String, Number, Object],
  name: String,
  min: [Number, String],
  isOptional: Boolean,
  // Used when toggling the `Optional` flag
  defaultValue: [String, Number, Object],
  labelLeft: {
    type: Boolean,
    default: false
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
      startVal = value.value;
      document.body.style.cursor = 'move';
    },
    onUpdate: (startX, startY, curX, curY) => {
      let diffX = curX - startX;
      let diffY = curY - startY;
      let newVal = Math.max(props.min, Math.floor(startVal - diffY/5.0));
      /*console.log("New value: " + newVal);*/
      value.value = newVal;
    },
    onEnd: () => {
    }
  })
}

let dragBall = ref(null);

onMounted(() => {
  setupDragBall(dragBall.value);
})

</script>

<template>
  <div class="NumberInput StdInput" :class="{ 'LabelLeft': labelLeft }">
    <div class="InputLabel" v-if="name && !labelLeft">{{name}}</div>
    <div class="Parent">
      <div class="InputLabel LeftLabel" v-if="name && labelLeft">{{name}}</div>
      <input v-if="isOptional" class="EditorInput OptionalToggle" v-model="optionalValue" type="checkbox" name="optionalToggle"/>
      <input class="EditorInput InputChild" type="number" v-model="value" min="min">
      <div class="DragBall InputChild" ref="dragBall">Drag</div>
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

.StdInput {
  margin-right: 16px;
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
  width: 1.2ch;
  flex-shrink: 0;
}

</style>
