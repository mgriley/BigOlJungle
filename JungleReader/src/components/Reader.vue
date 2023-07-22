<script setup>
import { ref, onMounted, computed } from 'vue'
import { gApp, FeedGroup, Feed, getTimeAgoStr } from '../State.js'

/*
See:
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_sidenav_fixed2
https://codepen.io/flaviocopes/pen/JZWOEK
*/

function launchTutorial() {
  // TODO
}
</script>

<template>
  <div class="toplevel">
    <div class="sidenav">
      <p class="AppTitle">JungleReader</p>
      <div class="SideMenu">
        <div class="Section">
          <div class="Flex">
            <button class="SaveButton" @click="gApp.saveAll()">Save</button>
            <!-- <h2 v-if="gApp.checkRequiresSave()">Must save!</h2> -->
          </div>
        </div>
        <div class="Section">
          <router-link to="/">My Feed</router-link>
          <router-link to="/starred">Starred</router-link>
          <router-link to="/history">History</router-link>
        </div>
        <div class="Section">
          <router-link to="/import">Import Config</router-link>
          <router-link to="/export">Export Config</router-link>
        </div>
        <div class="Section">
          <a href="#" @click.prevent="launchTutorial()">Tutorial</a>
          <router-link to="/settings">Settings</router-link>
        </div>
        <div class="Section">
          <router-link to="/about">About / Donate</router-link>
          <a href="TODO" target="_blank">JungleWriter</a>
          <a href="https://github.com/mgriley/BigOlJungle" target="_blank">GitHub</a>
        </div>
      </div>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.AppTitle {
  font-weight: bold;
  margin-bottom: 20px;
}

.toplevel {
  /* max-width: 1280px; */
  margin: auto;
  display: grid;
  padding: 20px 10px;
  /*grid-gap: 20px;*/
  grid-template-columns: 280px 1fr;
  grid-template-areas: 
    "sidebar content"
}

@media (max-width: 500px) {
  .wrapper {
    grid-template-columns: 4fr;
    grid-template-areas:
      "content"
      "sidebar"
  }
}

.main {
  grid-area: content;
  /*background-color: #20bf6b;*/
  padding: 20px;
}

.sidenav {
  grid-area: sidebar;
  padding: 20px;
  margin-left: 20px;
  /*background-color: #45aaf2;*/
}

.SideMenu a {
  display: block;
}

.SideMenu .Section {
  margin-bottom: 30px;
}

</style>
