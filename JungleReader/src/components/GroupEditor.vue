<script setup>
import { ref, onMounted, computed } from 'vue'
import BasicModal from 'Shared/BasicModal.vue'

const props = defineProps({
  group: Object
});

</script>

<template>
  <div class="FormFieldName">Name</div>
  <div>
    <input class="BasicTextInput" v-model="group.name" type="text" autofocus>
  </div>
</template>

<style scoped>
</style>
