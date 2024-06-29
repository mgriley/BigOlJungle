<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp } from '../State.js'

function goBack() {
  gApp.router.go(-1);
}
</script>

<template>
  <button class="BackButton Flex" @click="goBack">
    <vue-feather type="arrow-left" stroke-width="1" class="Icon BackButtonIcon"/>
    Back
  </button>
</template>

<style scoped>
.BackButton {
  /* float: right; */
  margin-bottom: var(--space-m);
  text-decoration-line: none;
}

.BackButtonIcon {
  margin-right: var(--space-xxs);
}
</style>
