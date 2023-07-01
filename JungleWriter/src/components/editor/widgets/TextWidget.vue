<script>
import * as State from '../State.js'

export class TextNode extends State.Node {
  static sUiShortName = "T";

  constructor() {
    super();
    this.name = "Text";
    this.componentName = "TextWidget";
    this.allowsChildren = false;
    this.text = "Hello World!";

    this.fontName = null;
    this.fontSize = 36;
    this.color = null;
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = null;
    this.letterSpacing = null;
    this.textAlign = 'left';
    this.maxWidth = null;
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      fontSize: this.fontSize + 'px',
      textAlign: this.textAlign,
    };
    if (this.fontName) {
      myStyle.fontFamily = this.fontName;
    }
    if (this.color) {
      myStyle.color = this.color;
    }
    if (this.bold) {
      myStyle.fontWeight = "bold";
    }
    if (this.italic) {
      myStyle.fontStyle = "italic";
    }
    if (this.underline) {
      myStyle.textDecoration = "underline";
    }
    if (this.lineHeight !== null) {
      myStyle.lineHeight = this.lineHeight;
    }
    if (this.letterSpacing !== null) {
      myStyle.letterSpacing = this.letterSpacing + 'px';
    }
    if (this.maxWidth !== null) {
      myStyle.maxWidth = this.maxWidth + 'px';
      // TODO - not wrapping properly
      myStyle.overflowWrap = "normal";
    }
    return {
      ...parentStyle,
      ...myStyle
    };
  }
};

</script>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import { gApp } from '../State.js'
import { setupWidget } from '../Utils.js'

const props = defineProps({
  node: Object
})

function onClick() {
  gApp.site.selectNode(props.node);
}

let elementRef = ref(null);

onMounted(() => {
  setupWidget(elementRef.value, props.node);
})

</script>

<template>
  <div class="Widget TextWidget" :style="node.getStyleObject()" ref="elementRef" @click="onClick">{{ node.text }}</div>
</template>

<style scoped>
</style>

<style>
.TextWidget {
  white-space: pre;
}
</style>

