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
import StyleInput from './StyleInput.vue'
import TextStyleInput from './TextStyleInput.vue'
import { gApp } from '../Globals.js'

const props = defineProps({
  editorData: Object
})


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
    <FontInput v-model="editorData.fontFamily" name="Font" @change="onFontChange"
      labelWidth="5ch"/>
    <NumberInput v-model="editorData.fontSize" name="Size" :min="1" :labelLeft="true" @change="onFontSizeChange"
      labelWidth="5ch" />
    <ColorInput :color="editorData.color" name="Color" @change="onColorChange"
      labelWidth="5ch" />
    <TextElement v-model="editorData.elementType" name="Type" class="mb-xs" labelWidth="5ch" />
  </div>
  <div class="mb-s">
    <TextStyleInput :textStyle="editorData.textStyle" />
    <TextAlignInput v-model="editorData.textAlign" />
  </div>
  <div class="mb-xs FlexRow">
    <NumberInput id="LineHeightInput" v-model="editorData.lineHeight" name="Line Height" :min="0" :increment="0.1"/>
    <NumberInput id="LetterSpacingInput" v-model="editorData.letterSpacing" name="Letter Spacing" :increment="0.1" />
  </div>

  <!--<textarea class="TextWidgetTextArea" v-model="editorData.text"></textarea>-->
  <!--
  <div class="mt-s">
    <TextEntryModal 
      v-model="editorData.text"
      title="Edit Text"
      buttonText="Big Editor"
      placeholder="Enter your text content here..."
      :updateWhileTyping="true"
    />
  </div>
  -->

  <div class="mt-s">
    <StyleInput :node="editorData" />
  </div>
</template>

<style scoped>
.TextWidgetTextArea {
  margin-top: var(--space-s);
  width: 100%;
  height: 150px;
  max-height: 200px;
  resize: none;
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
