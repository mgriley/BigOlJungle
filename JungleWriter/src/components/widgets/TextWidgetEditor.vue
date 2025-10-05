<script setup>
import { ref, onMounted, computed } from 'vue'
import NumberInput from './NumberInput.vue'
import BoolInput from './BoolInput.vue'
import TextInput from './TextInput.vue'
import TextAlignInput from './TextAlignInput.vue'
import FontInput from './FontInput.vue'
import ColorInput from './ColorInput.vue'
import LinkInput from './LinkInput.vue'
import TextEntryModal from './TextEntryModal.vue'
import PositionInput from './PositionInput.vue'
import TextElement from './TextElement.vue'
import { gApp } from '../Globals.js'

const props = defineProps({
  editorData: Object
})

const textModal = ref(null)

function openTextModal() {
  textModal.value.showModal()
}

function onFontChange(newFont) {
  if (gApp.site) {
    gApp.site.preferences.fontFamily = newFont
  }
}

function onFontSizeChange(newSize) {
  if (gApp.site) {
    gApp.site.preferences.fontSize = newSize
  }
}

function onColorChange(newColor) {
  if (gApp.site) {
    gApp.site.preferences.textColor = newColor
  }
}

</script>

<template>
  <PositionInput :node="editorData" :includeSize="true" class="mb-s" />
  <div class="mb-m">
    <TextElement v-model="editorData.elementType" name="Element" class="mb-xs" />
    <FontInput v-model="editorData.fontFamily" name="Font" @change="onFontChange"
      labelWidth="5ch"/>
    <NumberInput v-model="editorData.fontSize" name="Size" :min="1" :labelLeft="true" @change="onFontSizeChange"
      labelWidth="5ch" />
    <ColorInput :color="editorData.color" name="Color" @change="onColorChange"
      labelWidth="5ch" />
  </div>
  <div class="mb-s">
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
  <div class="mb-xs FlexRow">
    <NumberInput id="LineHeightInput" v-model="editorData.lineHeight" name="Line Height" :min="0" :increment="0.1"/>
    <NumberInput id="LetterSpacingInput" v-model="editorData.letterSpacing" name="Letter Spacing" :increment="0.1" />
  </div>
  <!-- <TextAreaInput class="TextWidgetTextArea" v-model="editorData.text" /> -->

  <div class="mb-m">
    <LinkInput :input="editorData.link" name="Link" />
  </div>

  <!--<textarea class="TextWidgetTextArea" v-model="editorData.text"></textarea>-->
  <div class="mt-s">
    <button class="EditTextButton" @click="openTextModal"><i class="bi bi-chat-right-text mr-xs"></i>Big Editor</button>
  </div>

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
  flex: 1;
  min-width: 32px;
  height: 24px;
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
  width: 100%;
  margin-top: var(--space-xxs);
  font-size: var(--f-m);
  padding: var(--space-xs) var(--space-m);
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

.FlexRow {
  display: flex;
  gap: var(--space-xxs);
  max-width: 100%;
}

#LineHeightInput {
  /*width: 150px;*/
}

#LetterSpacingInput {
  width: 150px;
}
</style>
