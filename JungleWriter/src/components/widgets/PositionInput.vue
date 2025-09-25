<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import NumberInput from './NumberInput.vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  includeSize: {
    type: Boolean,
    default: false
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

const width = computed({
  get() {
    return props.node.width
  },
  set(newWidth) {
    props.node.width = newWidth
  }
})

const height = computed({
  get() {
    return props.node.height
  },
  set(newHeight) {
    props.node.height = newHeight
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
        :labelLeft="true"
      />
      <NumberInput 
        v-model="posY" 
        name="Y" 
        class="CompactInput"
        :labelLeft="true"
      />
      <NumberInput 
        v-if="includeSize"
        v-model="width" 
        name="W" 
        class="CompactInput"
        :labelLeft="true"
      />
      <NumberInput 
        v-if="includeSize"
        v-model="height" 
        name="H" 
        class="CompactInput"
        :labelLeft="true"
      />
    </div>
  </div>
</template>

<style scoped>
.PositionInput {
  margin-right: 16px;
  margin-bottom: var(--space-xs);
}

.InputRow {
  display: flex;
  flex-direction: column;
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
