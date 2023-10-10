<script setup>
import { computed } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import ShortcutBtns from './ShortcutBtns.vue'
import NodeTreeView from './NodeTreeView.vue'
import PropEditor from './PropEditor.vue'
import SettingsEditor from './SettingsEditor.vue'
import FileEditor from './FileEditor.vue'
import NodeWidget from './widgets/NodeWidget.vue'

/*
let nodeList = computed(() => {
  let root = gApp.site.nodeTree.root
  let stack = [root];
  let nodes = [];
  while (stack.length > 0) {
    let node = stack.pop();
    nodes.push(node);
    for (let i = node.children.length - 1; i >= 0; --i) {
      stack.push(node.children[i]);
    }
  }
  return nodes;
});
*/

let rootNode = computed(() => {
  return gApp.site.nodeTree.root;
})

function onClickBackground(evt) {
  /*console.log("TargetId: "+evt.target.id);*/
  if (evt.target.id == "Main") {
    gApp.site.deselectAll();
  }
}

function getMainStyleObject() {
  return {
    'background-color': gApp.site.getSettings().backgroundColor
  };
}

let isEditing = computed(() => {
  return gApp.site.getIsEditing();
});

</script>

<template>  
  <NavBar v-if="isEditing" />
  <ShortcutBtns />
  <main id="Main" @click="onClickBackground" :style="getMainStyleObject()">
    <!--<h1>Hello World!</h1>-->
    <NodeTreeView v-if="isEditing" />
    <PropEditor v-if="isEditing" />
    <SettingsEditor v-if="isEditing" />
    <FileEditor v-if="isEditing" />

    <div class="AnchorDiv">
      <NodeWidget :node="rootNode" />
    </div>
  </main>
</template>

<style scoped>

main {
  height: 100vh;
}

.AnchorDiv {
  position: absolute;  
  /*width: auto;*/
  top: 50%;
  left: 50%;
  width: 0px;
  height: 0px;
  /*-webkit-transform: translate(-50%, -50%);*/
  /*transform: translate(-50%, -50%);*/
}

</style>
