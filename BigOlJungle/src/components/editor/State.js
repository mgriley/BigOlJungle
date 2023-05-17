import { reactive, ref } from 'vue'

class Node {
  constructor() {
    this.name = "Node";
    this.children = [];
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
  }

  save() {
  }

  exportSite() {
  }

  deployZip() {
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
};

