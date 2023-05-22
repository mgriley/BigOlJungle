<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { makeDraggableExt } from '../Utils.js'

const props = defineProps(['modelValue', 'min'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
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
      let newVal = Math.max(1, Math.floor(startVal - diffY/5.0));
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
  <div class="Parent">
    <input class="StdInput InputChild" type="number" v-model="value" min="min">
    <div class="DragBall InputChild" ref="dragBall">Drag</div>
  </div>
</template>

<style scoped>
.Parent {
  display: flex;
}

.StdInput {
  margin-right: 20px;
}

.DragBall {
  cursor: move;
  font-weight: bold;
}

.InputChild {
  /*display: inline-block;*/
  flex: 1;
}
</style>
