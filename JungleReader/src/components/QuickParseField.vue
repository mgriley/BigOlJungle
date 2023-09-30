<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'

const props = defineProps({
  item: Object
});

</script>

<template>
  <div class="AnnotateItem" :class="{IsEmpty: item.path.isEmpty()}">
    <div class="TextItems Flex">
      <p class="FeatherIcon"><vue-feather :type="item.path.isEmpty() ? 'circle' : 'check-circle'" /></p>
      <p class="NameText">{{ item.name }}</p>
      <p class="OptionalIndicator">{{ item.required ? "" : "(Optional)" }}</p>
    </div>
  </div>
</template>

<style scoped>
.AnnotateItem {
  /*
  border: 1px solid var(--secondary-text);
  border-radius: var(--border-radius-small);
  */
  padding: 0px 4px;
  /* margin-bottom: 4px; */
  /* display: inline-block; */
}

.AnnotateItem .TextItems {
  gap: 8px;
  align-items: center;
}

.AnnotateItem .FeatherIcon {
  color: orange;
}

.NameText {
  color: var(--main-text);
}

.OptionalIndicator {
  color: var(--mute-text);
}

.AnnotateItem .FeatherIcon {
  color: orange;
}


</style>
