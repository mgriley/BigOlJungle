<script setup>
import { gApp } from './State.js'

// See: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_treeview
</script>

<template>  
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
ul, #myUL {
  list-style-type: none;
}

#myUL {
  margin: 0;
  padding: 0;
}

.caret {
  cursor: pointer;
  -webkit-user-select: none; /* Safari 3.1+ */
  -moz-user-select: none; /* Firefox 2+ */
  -ms-user-select: none; /* IE 10+ */
  user-select: none;
}

.caret::before {
  content: "\25B6";
  color: black;
  display: inline-block;
  margin-right: 6px;
}

.caret-down::before {
  -ms-transform: rotate(90deg); /* IE 9 */
  -webkit-transform: rotate(90deg); /* Safari */'
  transform: rotate(90deg);  
}

.nested {
  display: none;
}

.active {
  display: block;
}
</style>

