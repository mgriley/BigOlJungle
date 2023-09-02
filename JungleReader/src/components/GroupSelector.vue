<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp } from '../State.js'

const props = defineProps({
  currentGroup: Object
});
const emit = defineEmits(['change'])

function onChange(changeEvt) {
  let newGroupId = changeEvt.target.value;
  console.log("Id: "+newGroupId);
  emit('change', gApp.feedReader.getGroupWithId(newGroupId));
}

</script>

<template>
  <div class="GroupSelector">
    <select v-if="currentGroup" :model="currentGroup.id" @change="onChange">
      <option v-for="group in gApp.feedReader.groups" :key="group.id" :value="group.id">
        {{ group.name }}
      </option>
    </select>
  </div>
</template>

<style scoped>
</style>
