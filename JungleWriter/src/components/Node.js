import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import {
  StaticIndexHtml, createElementString, stylesDictToInlineString
} from './StaticSiteTemplates.js'
import { gApp } from './globals.js'

export class Node {
  static sUiShortName = "G";

  constructor() {
    this.id = gApp.site.getNextNodeId();
    gApp.site.registerNode(this);
    this.type = "Node";

    this.name = "Group";
    this.parentNode = null;
    this.children = [];
    this.allowsChildren = true;
    this.selected = false;
    this.openInNodeTree = true;

    this.posX = 0;
    this.posY = 0;
  }

  writeToJson() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      openInNodeTree: this.openInNodeTree,
      posX: this.posX,
      posY: this.posY,
      allowsChildren: this.allowsChildren,
      children: this.children.map((c) => {
        return c.writeToJson();
      }),
    }
  }

  readFromJson(obj) {
    // console.log("Reading Node:", prettyJson(obj));
    this.id = obj.id;
    this.type = obj.type;
    this.name = obj.name;
    this.openInNodeTree = obj.openInNodeTree;
    this.posX = obj.posX;
    this.posY = obj.posY;
    this.allowsChildren = obj.allowsChildren;
    for (const childObj of obj.children) {
      let childNode = reactive(new (gNodeDataMap[childObj.type].nodeClass)());
      childNode.onCreate();
      childNode.readFromJson(childObj);
      this.addChildToBottom(childNode);
    }
  }

  onCreate() {
    // Override in subclasses
    // This is called after the ctor is called. The `this` here is the reactive proxy,
    // so register watchers/listeners here. If registered in the regular ctor, `this` will
    // not be reactive, so changes won't trigger updates.
  }

  onDestroy() {
    // Override in subclasses
    // Called before destroy()
  }

  destroy() {
    this.onDestroy();
    this.removeFromParent();
    gApp.site.unregisterNode(this.id);
  }

  static getNodeById(id) {
    return gApp.site.getNodeById(id);
  }

  // DEFER
  /*
  // Override in subclasses
  clone() {
    let clone = new Node();
    clone.name = this.name + "-Clone";
  }

  cloneSubtree() {
  }
  */

  isRoot() {
    return this.parentNode === null;
  }

  addChild(childNode) {
    this.addChildAtIndex(childNode, null);
  }

  // Use index=null to insert at end.
  addChildAtIndex(childNode, index) {
    if (!this.allowsChildren) {
      throw new Error("Does not allow children");
    }
    childNode.removeFromParent();
    if (index !== null) {
      this.children.splice(index, 0, childNode);    
    } else {
      // Add the start of the array (on top visually)
      this.children.unshift(childNode);
    }
    childNode.parentNode = this;
  }

  addChildToBottom(childNode) {
    this.addChildAtIndex(childNode, this.children.length);
  }

  removeFromParent() {
    if (this.parentNode !== null) {
      removeItem(this.parentNode.children, this);
      this.parentNode = null;
    }
  }

  isDescendantOf(potentialAncestor) {
    let current = this.parentNode;
    while (current) {
      if (current === potentialAncestor) {
        return true;
      }
      current = current.parentNode;
    }
    return false;
  }

  getIndexInParent() {
    if (!this.parentNode) {
      throw new Error("Unexpected");
    }
    let index = this.parentNode.children.findIndex((elem) => {
      return elem === this;
    });
    if (index === -1) {
      throw new Error("Unexpected");
    }
    return index;
  }

  // Moves this node so that it becomes the next sibling
  // of the given node.
  moveNode(otherNode) {
    if (!this.parentNode || this === otherNode) {
      return;
    }
    this.removeFromParent();
    if (!otherNode.parentNode) {
      otherNode.addChildAtIndex(this, 0);
    } else {
      let otherNodeIndex = otherNode.getIndexInParent();
      otherNode.parentNode.addChildAtIndex(this, otherNodeIndex + 1);
    }
  }

  swapChildren(indexA, indexB) {
    let childA = this.children[indexA];
    let childB = this.children[indexB];
    this.children[indexA] = childB;
    this.children[indexB] = childA;
  }

  moveUp() {
    if (!this.parentNode) {
      return;
    }
    let curIndex = this.getIndexInParent();
    if (curIndex > 0) {
      this.parentNode.swapChildren(curIndex, curIndex - 1);
    }
  }

  moveDown() {
    if (!this.parentNode) {
      return;
    }
    let curIndex = this.getIndexInParent();
    if (curIndex < this.parentNode.children.length - 1) {
      this.parentNode.swapChildren(curIndex, curIndex + 1);
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

  // Returns [{node: Node, depth: Number}] in DFS display order.
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

  getChildrenInHtmlOrder() {
    // The order stored in this.children is the visual stacking order,
    // where the topmost child is the first in the array.
    // The order displayed in HTML is the reverse of that,
    // because later elements are rendered on top of earlier ones.
    return [...this.children].reverse();
  }

  async generateStaticHtml(writer) {
    /**
     * Write HTML for this node to the proper place in the static site using
     * the given StaticSiteWriter.
     * 
     * Override in subclasses as needed.
     */
    let childHtml = await this.getChildHtml(writer);
    let htmlString = createElementString(
      'div', {class: "Widget NodeWidget"}, this.getStyleObject(),
      childHtml);
    return htmlString;
  }

  async getChildHtml(writer) {
    let htmlStrings = [];
    for (const child of this.getChildrenInHtmlOrder()) {
      let childHtml = await child.generateStaticHtml(writer);
      htmlStrings.push(childHtml);
    }
    return htmlStrings.join('\n');
  }

  // Same as Dfs variant but iterates in post-order because the last child
  // of any node is rendered on top of earlier children.
  /*
  iterateChildrenZOrder(nodeFunc) {
    let stack = [{node: this, depth: 0}];
    while (stack.length > 0) {
      let item = stack.pop();
      let visitChildren = nodeFunc(item.node, item.depth);
      if (visitChildren === false) {
        continue;
      }
      for (let i = 0; i < item.node.children.length; ++i) {
        stack.push({node: item.node.children[i], depth: item.depth + 1});
      }
    }
  }
  */
}

export class NodeTree {
  constructor() {
    this.root = new Node();
    this.root.name = "Root";
  }

  writeToJson() {
    return {
      root: this.root.writeToJson(),
    }
  }

  readFromJson(obj) {
    // console.log("Reading NodeTree:", prettyJson(obj));
    this.root.readFromJson(obj.root);
  }

  async generateStaticHtml(writer) {
    return await this.root.generateStaticHtml(writer);
  }
};
