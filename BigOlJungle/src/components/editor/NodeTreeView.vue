<script setup>
import { ref, onMounted } from 'vue'
import { gApp } from './State.js'
import { makeDraggable } from './Utils.js'
import NodeTreeItem from './NodeTreeItem.vue'

// See: https://vuejs.org/examples/#tree
// https://www.w3schools.com/howto/howto_js_draggable.asp

const nodeTree = gApp.site.nodeTree

const treeViewRef = ref(null)

onMounted(() => {
  makeDraggable(treeViewRef.value)
})

/*
const treeData = ref({
  name: 'My Tree',
  children: [
    { name: 'hello' },
    { name: 'world' },
    {
      name: 'child folder',
      children: [
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'world' }]
        },
        { name: 'hello' },
        { name: 'world' },
        {
          name: 'child folder',
          children: [{ name: 'hello' }, { name: 'world' }]
        }
      ]
    }
  ]
})
*/
</script>

<template>
  <div id="NodeTreeView" ref="treeViewRef">
    <div id="NodeTreeViewHeader">Nodes</div>  
    <div class="treeInner"> 
      <ul>
        <NodeTreeItem class="item" :model="nodeTree.root"></NodeTreeItem>
      </ul>
    </div>
  </div>
</template>

<style>
.item {
  cursor: pointer;
  line-height: 1.5;
}

.bold {
  font-weight: bold;
}

#NodeTreeView {
  position: absolute;
  z-index: 9;
  /*background-color: #0000;*/
  background: var(--color-background);
  border: 1px solid #d3d3d3;
  width: 300px;
  /*height: 400px;*/
}

#NodeTreeViewHeader {
  padding: 5px 20px;
  cursor: move;
  z-index: 10;
  background-color: #2196F3;
  color: #fff;
}

.treeInner {
  padding: 20px 5px;
}

</style>
