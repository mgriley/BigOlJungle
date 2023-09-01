<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import LinkSnippet from './LinkSnippet.vue'
import BasicSelector from './BasicSelector.vue'

let buttonGenerator = gApp.buttonGenerator

let smallImgButtonSize = ref('48px');
let smallImgButtonSizes = ['48px', '64px', '80px', '96px'];
let bigImgButtonSize = ref('256px');
let bigImgButtonSizes = ['200px', '256px', '512px'];

let feedLink = computed(() => {
  return Feed.makeShareLink(buttonGenerator.name, buttonGenerator.type, buttonGenerator.url);
})

let bigImgButton = computed(() => {
  let width = bigImgButtonSize.value;
  let imgSrc = window.location.origin + "/big_follow_button.svg"
  let html = `<a class="JRBigLink" href="${feedLink.value}" target="_blank"><img class="JRBigImg" src="${imgSrc}" width="${width}" alt="Big JungleReader link" /></a>`
  return html;
})

let smallImgButton = computed(() => {
  let width = smallImgButtonSize.value;
  let imgSrc = window.location.origin + "/small_follow_button.svg"
  let html = `<a class="JRSmallLink" href="${feedLink.value}" target="_blank"><img class="JRSmallImg" src="${imgSrc}" width="${width}" alt="Small JungleReader link" /></a>`
  return html
})

function changeSmallButtonSize(newVal) {
  smallImgButtonSize.value = newVal;
}

function changeBigButtonSize(newVal) {
  bigImgButtonSize.value = newVal;
}

</script>

<template>
<div class="ButtonGenerator">
  <div class="Fields">
    <h3><i>Enter:</i></h3>
    <div class="FormFieldName">Feed Name</div>
    <input v-model="buttonGenerator.name" placeholder="My Feed" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed Type</div>
    <input v-model="buttonGenerator.type" placeholder="RSS" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed URL</div>
    <input v-model="buttonGenerator.url" placeholder="https://www.mysite.com" class="Block WideInput BasicTextInput" autofocus>
  </div>
  <div class="Output">
    <h3><i>Output:</i></h3>
    <div class="FormFieldName">Link</div>
    <LinkSnippet :theLink="feedLink" />
    <div class="FormFieldName">HTML Big Button Link (as shown)</div>
    <div v-html="bigImgButton"></div>
    <BasicSelector :value="bigImgButtonSize" :options="bigImgButtonSizes" @change="changeBigButtonSize" />
		<LinkSnippet :theLink="bigImgButton" />
    <div class="FormFieldName">HTML Small Button Link (as shown)</div>
    <div v-html="smallImgButton"></div>
    <BasicSelector :value="smallImgButtonSize" :options="smallImgButtonSizes" @change="changeSmallButtonSize" />
    <LinkSnippet :theLink="smallImgButton" />
  </div>
</div>
</template>

<style scoped>
.Fields {
  /*
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 10px;
  */
}

.FormFieldName {
  font-size: 1rem;
  line-height: 1.5;
  margin-top: 5px;
}

.Output {
  margin-top: 16px;
}

.Output .FormFieldName {
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 16px;
}

</style>
