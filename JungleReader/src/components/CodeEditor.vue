<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'

// See: https://github.com/koca/vue-prism-editor/tree/feature/next
// PrismEditor Config {
// import Prism Editor
import { PrismEditor } from 'vue-prism-editor';
import 'vue-prism-editor/dist/prismeditor.min.css'; // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css';

// }

const props = defineProps({
  modelValue: [String],
})
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

function highlighter(code) {
  return Prism.highlight(code, Prism.languages.javascript);
}

</script>

<template>
  <div class="CodeEditor">
    <!-- <textarea v-model="value"></textarea> -->
    <prism-editor class="my-editor" v-model="value" :highlight="highlighter" line-numbers></prism-editor>
  </div>
</template>

<style scoped>

/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family: Fira code, Fira Mono, Consolas, Menlo, Courier, monospace;
  font-size: 22px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
/*
.prism-editor__textarea:focus {
  outline: none;
}
*/

</style>
