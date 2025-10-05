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
  <div class="PositionInput">
    <div class="InputRow">
      <div class="Row">
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
      </div>
      <div class="Row">
        <NumberInput 
          v-if="includeSize && width !== undefined"
          v-model="width" 
          name="W" 
          class="CompactInput WidthInput"
          :labelLeft="true"
          :min="1"
        />
        <NumberInput 
          v-if="includeSize && height !== undefined"
          v-model="height" 
          name="H" 
          class="CompactInput"
          :labelLeft="true"
          :min="1"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.PositionInput {
}

.InputRow {
  display: flex;
  flex-direction: column;
}

.Row {
  display: flex;
  flex-direction: row;
  gap: var(--space-xs);
}

.CompactInput {
  flex: 1;
  margin-right: 0;
  max-width: 50%;
}

.CompactInput .InputLabel {
  font-size: var(--smaller-size);
  margin-bottom: var(--space-xxs);
}
</style>
