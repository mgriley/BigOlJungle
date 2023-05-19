import { reactive, ref } from 'vue'
import { removeItem } from './Utils.js'

var gApp = null;

class Node {
  static sNodeIdCtr = 1;

  constructor() {
    this.id = Node.sNodeIdCtr++;
    this.name = "Node";
    this.componentName = "NodeWidget";
    this.parentNode = null;
    this.children = [];
    this.selected = false;
    this.openInNodeTree = true;

    this.posX = 0;
    this.posY = 0;
  }

  addChild(childNode) {
    childNode.removeFromParent();
    this.children.push(childNode);
    childNode.parentNode = this;
  }

  removeFromParent() {
    if (this.parentNode !== null) {
      removeItem(this.parentNode.children, this);
      this.parentNode = this;
    }
  }

  getStyleObject() {
    let style = {
      left: this.posX + 'px',
      top: this.posY + 'px',
    }
    if (this.selected) {
      // Note: style.border affects element size. outline is drawn
      // outside of it.
      style.outline = '1px solid lightgrey';
      style.cursor = 'move';
    }
    return style;
  }

  isSelected() {
    return this.selected;
  }

  // Returns [{node: Node, depth: Number}] in DFS order.
  // Includes this node for the first entry.
  getChildrenDfs() {
    let stack = [{node: this, depth: 0}];
    let output = [];
    while (stack.length > 0) {
      let item = stack.pop();
      output.push(item)
      for (let i = item.node.children.length - 1; i >= 0; --i) {
        stack.push({node: item.node.children[i], depth: item.depth + 1});
      }
    }
    return output;
  }

  // Covers same nodes as getChildrenDfs but runs nodeFunc on each node.
  // Return false from nodeFunc if do not wish to handle children.
  iterateChildrenDfs(nodeFunc) {
    let stack = [{node: this, depth: 0}];
    while (stack.length > 0) {
      let item = stack.pop();
      let visitChildren = nodeFunc(item.node, item.depth);
      if (visitChildren === false) {
        continue;
      }
      for (let i = item.node.children.length - 1; i >= 0; --i) {
        stack.push({node: item.node.children[i], depth: item.depth + 1});
      }
    }
  }
}

class NodeTree {
  constructor() {
    this.root = new Node();
  }
};


class Site {
  constructor() {
    this.name = "MySite";
    this.nodeTree = reactive(new NodeTree());
    this.selectedEntity = ref(null);
  }

  save() {
  }

  exportSite() {
  }

  deployZip() {
  }

  selectNode(node) {
    if (this.selectedEntity.value) {
      this.selectedEntity.value.selected = false;
    }
    this.selectedEntity.value = node;
    if (node) {
      node.selected = true;
    }
  }

  deselectAll() {
    if (this.selectedEntity.value) {
      this.selectedEntity.value.selected = false;
    }
    this.selectedEntity.value = null;
  }

  deleteSelectedNodes() {
    if (this.selectedEntity.value) {
      this.selectedEntity.value.removeFromParent();
      this.selectedEntity.value = null;
    }
  }

  getPropEditor() {
    return this.selectedEntity;
  }
};

class Editor {
  constructor() {
    this.site = null;
    this.createDummySite();
  }

  createDummySite() {
    this.site = new Site();  
  }

  createSite() {
  }

  openSite() {
  }

  importSite() {
  }
};

function onDeploy() {
  console.log("Deploying!")
}

function onNewFile() {
}

function onOpenFile() {
}

function onSaveFile() {
}

let kMenuItems = [
  {
    name: "File",
    items: [
      {
        name: "New",
        action: onNewFile,
      },
      {
        name: "Open",
        action: onOpenFile,
      },
      {
        name: "Save",
        action: onSaveFile,
      }
    ]
  },
  {
    name: "Insert"
  },
  {
    name: "Deploy",
    action: onDeploy
  },
  {
    name: "Settings"
  }
];

gApp = new Editor();

export {
  gApp,
  kMenuItems,
  Node
};

