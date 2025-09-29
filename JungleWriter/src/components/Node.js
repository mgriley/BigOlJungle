import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import {
  StaticIndexHtml, createElementString, stylesDictToInlineString
} from './StaticSiteTemplates.js'
import { gApp } from './Globals.js'

export class Node {
  static sUiShortName = "G";

  constructor(id) {
    this.id = id !== undefined ? id : (gApp?.site ? gApp.site.getNextNodeId() : 0);
    this.type = "Node";

    this.name = "Group";
    this.parentNode = null;
    this.children = [];
    this.selected = false;
    this.openInNodeTree = true;

    this.posX = 0;
    this.posY = 0;

    // Only register if we have a site and this isn't during JSON loading
    if (gApp?.site && id === undefined) {
      gApp.site.registerNode(this);
    }
  }

  writeToJson() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      openInNodeTree: this.openInNodeTree,
      posX: this.posX,
      posY: this.posY,
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
    for (const childObj of obj.children) {
      // Pass the ID from JSON to avoid auto-generation and registration
      let childNode = reactive(new (gNodeDataMap[childObj.type].nodeClass)(childObj.id));
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
    // Destroy all children first
    for (const child of this.children) {
      child.destroy();
    }
    // Then destroy this node
    this.onDestroy();
    this.removeFromParent();
    gApp.site.unregisterNode(this.id);
  }

  getAllowsChildren() {
    return true;
  }

  getPos() {
    return {x: this.posX, y: this.posY};
  }

  setPos(newPos) {
    this.posX = newPos.x;
    this.posY = newPos.y;
  }

  setCenterPos(newCenter) {
    let centerOffsetX = 0;
    let centerOffsetY = 0;
    if (this.width) {
      centerOffsetX = this.width / 2;
    }
    if (this.height) {
      centerOffsetY = this.height / 2;
    }
    this.posX = newCenter.x - centerOffsetX;
    this.posY = newCenter.y - centerOffsetY;
  }

  getGlobalPos() {
    /**
     * Calculate the global position of this node by accumulating
     * positions from all parent nodes up to the root.
     * @returns {Object} An object with x and y properties representing global position
     */
    let globalX = this.posX;
    let globalY = this.posY;
    let currentNode = this.parentNode;
    
    while (currentNode !== null) {
      globalX += currentNode.posX;
      globalY += currentNode.posY;
      currentNode = currentNode.parentNode;
    }
    
    return {x: globalX, y: globalY};
  }

  setGlobalPos(globalPos) {
    /**
     * Set the position of this node such that its global position becomes (x, y).
     * This adjusts the local position based on the positions of parent nodes.
     * @param {number} x - The desired global x position
     * @param {number} y - The desired global y position
     */
    if (!this.parentNode) {
      this.posX = globalPos.x;
      this.posY = globalPos.y;
      return;
    }
    let localPos = this.parentNode.convertGlobalToLocalPos(globalPos);
    this.posX = localPos.x;
    this.posY = localPos.y;
  }

  convertLocalToGlobalPos(localPos) {
    /**
     * Convert a local position (relative to this node) to global coordinates.
     * @param {Object} localPos - An object with x and y properties representing local position
     * @returns {Object} An object with x and y properties representing global position
     */
    const nodeGlobalPos = this.getGlobalPos();
    return {
      x: nodeGlobalPos.x + localPos.x,
      y: nodeGlobalPos.y + localPos.y
    };
  }

  convertGlobalToLocalPos(globalPos) {
    /**
     * Convert a global position to local coordinates (relative to this node).
     * @param {Object} globalPos - An object with x and y properties representing global position
     * @returns {Object} An object with x and y properties representing local position
     */
    const nodeGlobalPos = this.getGlobalPos();
    return {
      x: globalPos.x - nodeGlobalPos.x,
      y: globalPos.y - nodeGlobalPos.y
    };
  }

  static getNodeById(id) {
    return gApp.site.getNodeById(id);
  }

  static calculateBoundingBoxFromDOM() {
    /**
     * Calculates the total bounding box of the node tree by iterating through
     * the actual DOM elements, starting from the #RootNode selector.
     * Returns an object with {minX, minY, maxX, maxY, width, height} or null if no elements found.
     */
    const rootElement = document.querySelector('#RootNode');
    if (!rootElement) {
      console.warn('Root node element not found in DOM');
      return null;
    }

    // Find all widget elements within the root
    const widgets = rootElement.querySelectorAll('.Widget');
    if (widgets.length === 0) {
      return null;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasValidBounds = false;

    widgets.forEach(widget => {
      const rect = widget.getBoundingClientRect();
      const rootRect = rootElement.getBoundingClientRect();
      
      // Calculate position relative to the root element
      const relativeX = rect.left - rootRect.left;
      const relativeY = rect.top - rootRect.top;
      const relativeRight = relativeX + rect.width;
      const relativeBottom = relativeY + rect.height;

      // Only consider elements with actual dimensions
      if (rect.width > 0 || rect.height > 0) {
        minX = Math.min(minX, relativeX);
        minY = Math.min(minY, relativeY);
        maxX = Math.max(maxX, relativeRight);
        maxY = Math.max(maxY, relativeBottom);
        hasValidBounds = true;
      }
    });

    if (!hasValidBounds) {
      return null;
    }

    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  _cloneSelf() {
    // Override this in subclasses
    if (!this.parentNode) {
      throw new Error("Cannot clone the Root node");
    }
    let clone = gApp.site.createNode(Node);
    clone.name = this.name;
    clone.posX = this.posX + 20;
    clone.posY = this.posY + 20;
    return clone;
  }

  clone() {
    let clone = this._cloneSelf();
    for (const child of this.children) {
      let childClone = child.clone();
      clone.addChild(childClone);
    }
    return clone;
  }

  cloneAndAddAsSibling() {
    if (!this.parentNode) {
      throw new Error("Cannot clone the Root node");
    }
    let clone = this.clone();
    this.addSiblingAfter(clone);
    return clone;
  }

  isRoot() {
    return this.parentNode === null;
  }

  addChild(childNode) {
    this.addChildAtIndex(childNode, null);
  }

  // Use index=null to insert at end.
  addChildAtIndex(childNode, index) {
    if (!this.getAllowsChildren()) {
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

  addSiblingAfter(siblingNode) {
    if (!this.parentNode) {
      throw new Error("Root node cannot have siblings");
    }
    let myIndex = this.getIndexInParent();
    this.parentNode.addChildAtIndex(siblingNode, myIndex + 1);
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

  moveToNode(newParentNode, index=null) {
    if (!newParentNode.getAllowsChildren()) {
      throw new Error("New parent does not allow children");
    }
    if (this === newParentNode || newParentNode.isDescendantOf(this)) {
      throw new Error("Cannot move node to itself or its descendant");
    }
    // Note - we want to preserve global position so that nothing changes visually
    // when the do the move (other than maybe z-order).
    let originalGlobalPos = this.getGlobalPos();
    this.removeFromParent();
    newParentNode.addChildAtIndex(this, index);
    this.setGlobalPos(originalGlobalPos);
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
    // Root node always has id=0
    this.root = new Node(0);
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
