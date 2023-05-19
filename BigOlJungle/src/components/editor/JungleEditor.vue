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
</script>

<template>  
  <NavBar />
  <main>
    <!--<h1>Hello World!</h1>-->
    <NodeTreeView />
    <PropEditor />

    <div class="AnchorDiv">
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
  width: 600px;
  height: 800px;
  /*-webkit-transform: translate(-50%, -50%);*/
  /*transform: translate(-50%, -50%);*/
}
</style>
