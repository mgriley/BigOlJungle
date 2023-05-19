<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

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
  var startX = 0;
  var startY = 0;
  var startVal = null;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();

    startVal = value.value;
    startX = e.clientX;
    startY = e.clientY;

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;

    document.body.style.cursor = 'move';
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();

    let diffX = e.clientX - startX;
    let diffY = e.clientY - startY;

    let newVal = Math.max(1, Math.floor(startVal - diffY/5.0));
    /*console.log("New value: " + newVal);*/
    value.value = newVal;
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    document.body.style.cursor = "default";
  }
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
