<script>
import * as State from '../State.js'

export class TextNode extends State.Node {
  constructor() {
    super();
    this.componentName = "TextWidget";
    this.text = "Hello World!";

    this.fontName = null;
    this.fontSize = 18;
    this.color = null;
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.lineHeight = null;
    this.letterSpacing = null;
  }
};

</script>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  node: Object
})

</script>

<template>
  <p class="TextWidget">{{ node.text }}</p>
</template>

<style scoped>
.TextWidget {
  /*font-family: v-bind('node.fontName');*/
  /*font-size: v-bind('node.fontSize');*/
  font-size: 18px;
}
</style>
