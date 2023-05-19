<script>
import * as State from '../State.js'

export class TextNode extends State.Node {
  constructor() {
    super();
    this.componentName = "TextWidget";
    this.text = "Hello World!";

    this.fontName = null;
    this.fontSize = 36;
    this.color = null;
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = null;
    this.letterSpacing = null;
    this.maxWidth = 100;
  }

  getStyleObject() {
    let parentStyle = super.getStyleObject();
    let myStyle = {
      fontSize: this.fontSize + 'px'     
    };
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

