<script setup>
import { ref, onMounted, computed } from 'vue'
import { FeedGroup } from '../State.js'

const props = defineProps({
  group: Object
});

const dummyGroup = new FeedGroup(0);

const realGroup = computed(() => {
  return props.group ? props.group : dummyGroup;
});

</script>

<template>
  <div class="FormFieldName">Name</div>
  <div>
    <input class="BasicTextInput" v-model="realGroup.name" type="text" autofocus>
  </div>
</template>

<style scoped>
</style>
