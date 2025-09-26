<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import TextAlignInput from './TextAlignInput.vue'
import FontInput from './FontInput.vue'
import ColorInput from './ColorInput.vue'
import TextEntryModal from './TextEntryModal.vue'

const props = defineProps({
  editorData: Object
})

const textModal = ref(null)

function openTextModal() {
  textModal.value.showModal()
}


</script>

<template>
  <div class="mb-m">
    <FontInput v-model="editorData.fontFamily" name="Font" />
    <NumberInput v-model="editorData.fontSize" name="Size" :min="1" :labelLeft="true" />
    <ColorInput :color="editorData.color" name="Color"/>
  </div>
  <div class="mb-m">
    <div class="FontStyleButtons">
      <button 
        class="StyleToggle" 
        :class="{ active: editorData.bold }"
        @click="editorData.bold = !editorData.bold"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button 
        class="StyleToggle" 
        :class="{ active: editorData.italic }"
        @click="editorData.italic = !editorData.italic"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button 
        class="StyleToggle" 
        :class="{ active: editorData.underline }"
        @click="editorData.underline = !editorData.underline"
        title="Underline"
      >
        <span style="text-decoration: underline;">U</span>
      </button>
    </div>
    <TextAlignInput v-model="editorData.textAlign" />
  </div>
  <NumberInput v-model="editorData.lineHeight" name="Line Height" :min="0" :isOptional="false" :defaultValue="1.15" :increment="0.1"/>
  <NumberInput v-model="editorData.letterSpacing" name="Letter Spacing" :isOptional="false" :defaultValue="0" :increment="0.1" />
  <NumberInput v-model="editorData.maxWidth" name="Max Width" :min="0" :isOptional="true" :defaultValue="200" />
  <!-- <TextAreaInput class="TextWidgetTextArea" v-model="editorData.text" /> -->
  <!-- <TextInput v-model="editorData.linkUrl" name="Link URL" /> -->
  <textarea class="TextWidgetTextArea" v-model="editorData.text"></textarea>
  <button class="EditTextButton" @click="openTextModal">Edit Text</button>

  <TextEntryModal 
    ref="textModal"
  >
    <textarea 
      class="ModalTextArea" 
      v-model="editorData.text"
      placeholder="Enter your text content here..."
    ></textarea>
  </TextEntryModal>
</template>

<style scoped>
.TextWidgetTextArea {
  margin-top: var(--space-s);
  width: 100%;
  height: 150px;
  max-height: 200px;
  resize: none;
}

.FontStyleButtons {
  display: flex;
  flex-direction: row;
  gap: var(--space-xxs);
  margin-bottom: var(--space-xs);
}

.StyleToggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--f-s);
  font-weight: normal;
}

.StyleToggle:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.StyleToggle.active {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--darkest-color);
}

.StyleToggle strong {
  font-weight: bold;
}

.StyleToggle em {
  font-style: italic;
  font-family: serif;
  font-size: 18px;
}

.EditTextButton {
  margin-top: var(--space-xs);
  padding: var(--space-xs) var(--space-s);
  background-color: var(--input-bg);
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  color: var(--input-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.EditTextButton:hover {
  background-color: var(--medium-color);
  border-color: var(--light-color);
}

.ModalTextArea {
  width: 100%;
  height: 100%;
  padding: var(--space-xs);
  border: 1px solid var(--medium-color);
  border-radius: var(--border-radius-s);
  background-color: var(--input-bg);
  color: var(--input-text);
  font-family: inherit;
  font-size: var(--f-s);
  resize: none;
  overflow-y: auto;
  flex: 1;
}

.ModalTextArea:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}
</style>
