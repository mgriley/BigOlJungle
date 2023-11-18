<script setup>
import { ref, onMounted, reactive, computed } from 'vue'

const props = defineProps({
  item: Object
})

</script>

<template>
  <div v-if="item.children == undefined || item.children.length == 0">
    <a :href="item.href" download><p>{{ item.name }}</p></a>
  </div>
  <div v-else>
    <div @click="item.isOpen = !item.isOpen">{{ item.name }}{{ item.isOpen ? "" : "..." }}</div>
    <div v-if="item.isOpen">
      <FilesPageItem v-for="child in item.children" :item="child" />
    </div>
  </div>
</template>

<style scoped>
</style>
