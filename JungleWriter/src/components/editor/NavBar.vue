<script setup>
import { kMenuItems } from './State.js'

</script>

<template>  
  <div class="NavBar">
    <p class="MenuIcon">JW</p>
    <div class="InnerMenu">
      <div v-for="item in kMenuItems" class="MenuItem">
        <p>
          <a v-if="item.action" href="#" @click="item.action()">{{ item.name }}</a>
          <a href="#" v-else>{{ item.name }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.NavBar {
  position: absolute;
  top: 16px;
  left: 16px;
  display: inline-block;
  z-index: 10;
}

.MenuIcon {
  border: 1px solid blue;
  border-radius: 4px;
  display: inline-block;
}

.NavBar .InnerMenu {
  display: none;
  background-color: blue;
}

.NavBar:hover .InnerMenu {
  display: block;
}

.MenuItem {
}

</style>

