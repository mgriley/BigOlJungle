<script setup>
</script>

<template>
  <button class="DeleteButton SmallButton"><vue-feather type="trash-2" class="Icon"/>Delete</button>
</template>

<style scoped>
.DeleteButton {
  display: flex;
  flex: row nowrap;
  align-items: center;
}

.DeleteButton .Icon {
  color: var(--bright-red);
  margin-right: var(--space-xxs);
}

</style>
