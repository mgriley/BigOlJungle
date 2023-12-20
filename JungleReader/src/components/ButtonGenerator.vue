<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed } from '../State.js'
import LinkSnippet from './LinkSnippet.vue'
import BasicSelector from './BasicSelector.vue'

let buttonGenerator = gApp.buttonGenerator

let smallImgButtonSize = ref('32px');
let smallImgButtonSizes = ['32px', '48px', '64px', '80px', '96px'];
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
  // let imgSrc = window.location.origin + "/small_follow_button.svg"
  let imgSrc = window.location.origin + "/Favicon.png"
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
    <h4>Enter:</h4>
    <div class="FormFieldName">Feed Name</div>
    <input v-model="buttonGenerator.name" placeholder="My Feed" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed Type</div>
    <input v-model="buttonGenerator.type" placeholder="RSS" class="Block WideInput BasicTextInput" autofocus>
    <div class="FormFieldName">Feed URL</div>
    <input v-model="buttonGenerator.url" placeholder="https://www.mysite.com" class="Block WideInput BasicTextInput" autofocus>
  </div>
  <div class="Output">
    <h4>Your link and button:</h4>
    <div class="FormFieldName">Add-Feed Link</div>
    <LinkSnippet :theLink="feedLink" class="MarginBotS"/>
    <p>You can download the JungleReader logo and have it link to your 'AddFeed' link, like this:</p>
    <div class="BtnPreview MarginBotS" v-html="smallImgButton"></div>
    <p>
      <a href="Favicon.png" download="jr_logo">Download logo</a>
    </p>
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

.Output {
  margin-top: 16px;
}

.BtnPreview {
  margin-top: var(--space-xs);
  /*
  display: inline-block;
  padding: 4px;
  border: 2px dashed var(--main-bg);
  background-color: white;
  */
}

</style>

<style>
.JRSmallLink, .JRBigLink {
  background-color: none;
}
</style>

