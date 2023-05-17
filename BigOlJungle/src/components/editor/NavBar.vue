<script setup>
import { kMenuItems } from './State.js'

</script>

<template>  

  <!-- https://www.w3schools.com/css/tryit.asp?filename=trycss_navbar_horizontal_black_fixed -->
  <!--
  <div>
    <ul>
      <li><a class="active" href="#home">Home</a></li>
      <li><a href="#news">News</a></li>
      <li><a href="#contact">Contact</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </div>
  -->
  <div>
    <ul>
      <li><a class="BarTitle">JungleVine Editor</a></li>
      <li v-for="item in kMenuItems">
        <a v-if="item.action" href="#" @click="item.action()">{{ item.name }}</a>
        <a href="#" v-else>{{ item.name }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.BarTitle {
  font-weight: bold;
}

ul {
  list-style-type: none;
  margin: 0;
  padding: 0px 20px;
  overflow: hidden;
  background-color: #333;
  position: fixed;
  top: 0;
  width: 100%;
}

li {
  float: left;
}

li a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
}

li a:hover:not(.active) {
  background-color: #111;
}

.active {
  background-color: #04AA6D;
}
</style>

