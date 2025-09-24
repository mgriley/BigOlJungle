<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import TextAlignInput from './TextAlignInput.vue'
import FontInput from './FontInput.vue'
import ColorInput from './ColorInput.vue'

const props = defineProps({
  editorData: Object
})

</script>

<template>
  <FontInput v-model="editorData.fontFamily" name="Font Family" :isOptional="true" />
  <NumberInput v-model="editorData.fontSize" name="Font Size" min="1" />
  <ColorInput v-model="editorData.color" name="Color" :isOptional="true" />
  <div class="FontStyleButtons">
    <BoolInput class="Item" v-model="editorData.bold" name="Bold" />
    <BoolInput class="Item" v-model="editorData.italic" name="Italic" />
    <BoolInput class="Item" v-model="editorData.underline" name="Underline" />
  </div>
  <TextAlignInput v-model="editorData.textAlign" />
  <NumberInput v-model="editorData.lineHeight" name="Line Height" min="0" :isOptional="true" :defaultValue="1.25"/>
  <NumberInput v-model="editorData.letterSpacing" name="Letter Spacing" min="0" :isOptional="true" :defaultValue="1"/>
  <NumberInput v-model="editorData.maxWidth" name="Max Width" min="0" :isOptional="true" :defaultValue="200" />
  <!-- <TextAreaInput class="TextWidgetTextArea" v-model="editorData.text" /> -->
  <!-- <TextInput v-model="editorData.linkUrl" name="Link URL" /> -->
  <textarea class="TextWidgetTextArea" v-model="editorData.text"></textarea>
</template>

<style scoped>
.TextWidgetTextArea {
  margin-top: var(--space-s);
  width: 100%;
  /* resize: vertical; */
}

.FontStyleButtons {
  display: flex;
  flex-direction: row;
}

.FontStyleButtons .Item {
  margin-right: 10px;
}
</style>
