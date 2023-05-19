<script setup>
import { computed } from 'vue'
import { gApp } from './State.js'
import NavBar from './NavBar.vue'
import NodeTreeView from './NodeTreeView.vue'
import PropEditor from './PropEditor.vue'
import { kWidgetMap } from './widgets/Widgets.js'

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

function onClickBackground(evt) {
  /*console.log("TargetId: "+evt.target.id);*/
  if (evt.target.id == "Main") {
    gApp.site.deselectAll();
  }
}
</script>

<template>  
  <NavBar />
  <main id="Main" @click="onClickBackground">
    <!--<h1>Hello World!</h1>-->
    <NodeTreeView />
    <PropEditor />

    <div id="RootAnchorDiv" class="AnchorDiv">
      <template v-for="node in nodeList">
        <component v-if="node.componentName !== null" :is="kWidgetMap[node.componentName]" :node="node" />
      </template>
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
