<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps(['modelValue', 'name', 'helpText'])
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>

<template>
  <div class="StdInput BoolParent">
    <div class="CheckboxRow">
      <input v-model="value" type="checkbox" name="name" class="Checkbox" />
      <label for="name">{{name}}</label>
    </div>
    <div class="HelpText" v-if="helpText">{{helpText}}</div>
  </div>
</template>

<style scoped>
.BoolParent {
  font-size: var(--f-m);
}

.CheckboxRow {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
}

.CheckboxRow input {
  margin-right: 4px;
}

.Checkbox {
  width: 16px;
  height: 16px;
}

.HelpText {
  font-size: var(--f-xs);
  color: var(--mute-text);
  margin-top: var(--space-xxs);
  line-height: 1.4;
}
</style>
