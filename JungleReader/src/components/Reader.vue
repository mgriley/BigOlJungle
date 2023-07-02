<script setup>
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
      <p class="AppTitle">ToucanReader</p>
      <div class="SideMenu">
        <div class="Section">
          <router-link to="/">My Feed</router-link>
          <router-link to="/starred">Starred</router-link>
          <router-link to="/history">History</router-link>
        </div>
        <div class="Section">
          <router-link to="/plugins">Plugins</router-link>
          <router-link to="/import">Import Config</router-link>
          <router-link to="/export">Export Config</router-link>
        </div>
        <div class="Section">
          <a href="#" @click.prevent="launchTutorial()">Tutorial</a>
          <router-link to="/settings">Settings</router-link>
        </div>
        <div class="Section">
          <a href="TODO">ToucanWriter</a>
          <a href="https://github.com/mgriley/BigOlJungle">GitHub</a>
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
  max-width: 1280px;
  margin: auto;
  display: grid;
  padding: 20px 10px;
  /*grid-gap: 20px;*/
  grid-template-columns: 1fr 3fr;
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

header {
  grid-area: header;
  background-color: #fed330;
  padding: 20px;
}

.main {
  grid-area: content;
  /*background-color: #20bf6b;*/
  padding: 20px;
}

.sidenav {
  grid-area: sidebar;
  padding: 20px;
  /*background-color: #45aaf2;*/
}

.SideMenu a {
  display: block;
}

.SideMenu .Section {
  margin-bottom: 30px;
}

footer {
  padding: 20px;
  grid-area: footer;
  background-color: #fd9644;
}

</style>
