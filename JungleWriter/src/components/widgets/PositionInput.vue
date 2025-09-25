<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import NumberInput from './NumberInput.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
})

const posX = computed({
  get() {
    return props.node.posX
  },
  set(newPosX) {
    props.node.posX = newPosX
  }
})

const posY = computed({
  get() {
    return props.node.posY
  },
  set(newPosY) {
    props.node.posY = newPosY
  }
})
</script>

<template>
  <div class="PositionInput StdInput">
    <div class="InputRow">
      <NumberInput 
        v-model="posX" 
        name="X" 
        class="CompactInput"
      />
      <NumberInput 
        v-model="posY" 
        name="Y" 
        class="CompactInput"
      />
    </div>
  </div>
</template>

<style scoped>
.PositionInput {
  margin-right: 16px;
}

.InputRow {
  display: flex;
  gap: var(--space-xs);
}

.CompactInput {
  flex: 1;
  margin-right: 0;
}

.CompactInput .InputLabel {
  font-size: var(--smaller-size);
  margin-bottom: var(--space-xxs);
}
</style>
