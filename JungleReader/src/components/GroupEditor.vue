<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'

const props = defineProps({
  group: Object
});

</script>

<template>
  <div>
    <input class="GroupNameEdit" v-model="group.name" type="text" autofocus>
  </div>
</template>

<style scoped>
.GroupNameEdit {
  font-size: 1.5rem;
}
</style>
