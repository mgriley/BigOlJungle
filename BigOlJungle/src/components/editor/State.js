import { reactive, ref } from 'vue'
import { removeItem } from './Utils.js'

class Node {
  constructor() {
    this.name = "Node";
    this.componentName = null;
    this.parentNode = null;
    this.children = [];
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
    this.selectedEntity.value = node;
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

var gApp = new Editor();

export {
  gApp,
  kMenuItems,
  Node
};

