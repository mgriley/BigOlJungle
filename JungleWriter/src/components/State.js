import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { UserStorage } from './UserStorage.js'
import { FileStorage } from './FileStorage.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import {
  downloadTextFile, downloadBlobFile, IntervalTimer,
  hashObject, RectUtils,
} from 'Shared/SharedUtils.js'
import { StaticSiteWriter } from './StaticSiteWriter.js'
import {
  StaticIndexHtml, StaticInteractiveJs, createElementString, stylesDictToInlineString, escapeHtml,
  applyIndent,
} from './StaticSiteTemplates.js'

import { NodeTree, Node } from './Node.js'
import { ImageNode } from './widgets/ImageNode.js'
import { ColorInput } from './widgets/ColorInput.js'

import { gApp, setGApp } from './Globals.js';
import { Post, PostsFeed } from './Post.js'
import { gToastManager } from './Toast.js'

const kDefaultDesignWidth = 800;
const kDefaultDesignHeight = 600;

class SiteSettings {
  constructor() {
    this.siteName = "";
    this.description = "";
    this.faviconSrcName = "";
    this.backgroundColor = new ColorInput('#ffffff', 1.0);
    this.canvasWidth = 4000;
    this.canvasHeight = 4000;
    this.enableWASDNavigation = false;
    this.showDesignGuide = true;
  }

  writeToJson() {
    return {
      siteName: this.siteName,
      description: this.description,
      faviconSrcName: this.faviconSrcName,
      backgroundColor: this.backgroundColor.writeToJson(),
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      enableWASDNavigation: this.enableWASDNavigation,
      showDesignGuide: this.showDesignGuide,
    }
  }

  readFromJson(obj) {
    this.siteName = obj.siteName ? obj.siteName : "";
    this.description = obj.description ? obj.description : "";
    this.faviconSrcName = obj.faviconSrcName ? obj.faviconSrcName : "";
    if (obj.backgroundColor) {
      this.backgroundColor.readFromJson(obj.backgroundColor);
    }
    if (obj.canvasWidth) {
      this.canvasWidth = obj.canvasWidth;
    }
    if (obj.canvasHeight) {
      this.canvasHeight = obj.canvasHeight;
    }
    this.enableWASDNavigation = obj.enableWASDNavigation ? obj.enableWASDNavigation : false;
    if (obj.showDesignGuide !== undefined) {
      this.showDesignGuide = obj.showDesignGuide;
    }
  }
}

/**
 * Preferences are defaults automatically stored per site, like the last
 * font family and size used, etc.
 */
class SitePreferences {
  constructor() {
    this.fontFamily = "sans-serif";
    this.fontSize = 36;
    this.textColor = new ColorInput('#000000', 1.0);
  }

  writeToJson() {
    return {
      fontFamily: this.fontFamily,
      fontSize: this.fontSize,
      textColor: this.textColor.writeToJson(),
    }
  }

  readFromJson(obj) {
    if (obj.fontFamily) {
      this.fontFamily = obj.fontFamily;
    }
    if (obj.fontSize) {
      this.fontSize = obj.fontSize;
    }
    if (obj.textColor) {
      this.textColor.readFromJson(obj.textColor);
    }
  }
}

let kDefaultCustomCssString = `/* Write your site's custom CSS here */
/* If you're new to CSS, ask ChatGPT for some help */

/*
Example 1 - Try giving some elements the class "RedBackground".
Note - use !important to override styles set from the editor.
*/
.RedBackground {
  background-color: red !important;
}

/*
Example 2 - Use ids to give specific elements custom styles.
*/
#YourIdGoesHere {
  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
}
`;

class Site {
  constructor(editor, id, siteDir) {
    this.editor = editor;
    this.id = id;
    this.name = "";
    this.version = "1";
    this.nodeTree = new NodeTree();
    this.selectedItems = reactive([]);
    this.settings = new SiteSettings();
    this.preferences = new SitePreferences();
    this.isEditing = true;
    this.postsFeed = new PostsFeed();
    this.blogFeed = new PostsFeed();
    this.galleryFeed = new PostsFeed();
    this.filesPageConfig = "";
    this.customCssString = kDefaultCustomCssString;
    this.resolvedFilesDict = {};
    this._lastSavedHash = null;
    this.lastModifiedTime = new Date();

    this.translateX = 0;
    this.translateY = 0;

    this.pageWidth = null;
    this.pageHeight = null;

    // Node state management
    this.nodeIdCtr = 1;
    this.nodeLookupMap = {};

    // siteDir is the DirObj for the current site, for convenience.
    // It is set from the Editor
    this.siteDir = siteDir;

    // This is put here to support the ImageChooser components, which require 
    // a list of all image files (along with URLS).
    this.imageFiles = []

    // Set up file change listener to update image files
    this._fileChangeListener = null;
  }

  writeToJson() {
    let obj = {
      id: this.id,
      name: this.name,
      version: this.version,
      nodeTree: this.nodeTree.writeToJson(),
      settings: this.settings.writeToJson(),
      preferences: this.preferences.writeToJson(),
      postsFeed: this.postsFeed.writeToJson(),
      blogFeed: this.blogFeed.writeToJson(),
      galleryFeed: this.galleryFeed.writeToJson(),
      filesPageConfig: this.filesPageConfig,
      customCssString: this.customCssString,
      nodeIdCtr: this.nodeIdCtr,
      lastModifiedTime: this.lastModifiedTime.getTime(),
    };
    return obj;
  }

  readFromJson(obj) {
    if ('id' in obj) {
      this.id = obj.id;
    }
    if ('name' in obj) {
      this.name = obj.name;
    }
    if ('version' in obj) {
      this.version = obj.version;
    }
    if ('nodeIdCtr' in obj) {
      this.nodeIdCtr = obj.nodeIdCtr;
    }
    if ('lastModifiedTime' in obj) {
      this.lastModifiedTime = new Date(obj.lastModifiedTime);
    } else {
      this.lastModifiedTime = new Date();
    }
    if ('nodeTree' in obj) {
      this.nodeTree.readFromJson(obj.nodeTree);
    }
    if ('settings' in obj) {
      this.settings.readFromJson(obj.settings);
    }
    if ('preferences' in obj) {
      this.preferences.readFromJson(obj.preferences);
    }
    if ('postsFeed' in obj) {
      this.postsFeed.readFromJson(obj.postsFeed);
    }
    if ('blogFeed' in obj) {
      this.blogFeed.readFromJson(obj.blogFeed);
    }
    if ('galleryFeed' in obj) {
      this.galleryFeed.readFromJson(obj.galleryFeed);
    }
    if ('filesPageConfig' in obj) {
      this.filesPageConfig = obj.filesPageConfig || "";
    }
    if (obj.customCssString) {
      this.customCssString = obj.customCssString;
    }
  }

  _calcCanvasScale() {
    /**
     * Calculate the scale necessary so that the designWidth is contained in the pageWidth
     * Returns 1.0 if pageWidth/pageHeight are not set or if no scaling is needed
     */
    if (!this.pageWidth || !this.pageHeight) {
      return 1.0;
    }
    
    const designWidth = kDefaultDesignWidth;
    
    // Add some margin to prevent the design from touching the edges
    const margin = 16;
    const availableWidth = this.pageWidth - (margin * 2);
    
    if (availableWidth <= 0) {
      return 1.0;
    }
    
    // Calculate scale to fit design width within available width
    const scale = availableWidth / designWidth;
    
    // Clamp scale to reasonable bounds (don't scale up beyond 1.0, don't scale down too much)
    return Math.max(0.5, Math.min(scale, 1.0));
  }

  getMainStyleObject() {
    let canvasWidth = this.settings.canvasWidth;
    let canvasHeight = this.settings.canvasHeight;
    //let canvasScale = this._calcCanvasScale();
    let canvasScale = 1.0;
    return {
      'background-color': this.settings.backgroundColor.getColorValue(),
      '--translateX': this.translateX + 'px',
      '--translateY': this.translateY + 'px',
      '--canvas-scale': canvasScale,
      // Design guide styles (purely for editor use)
      '--design-width': kDefaultDesignWidth + 'px',
      '--design-height': kDefaultDesignHeight + 'px',
      '--design-guide-color': 'darkgrey',
      //'--canvasWidth': canvasWidth + 'px',
      //'--canvasHeight': canvasHeight + 'px',
    };
  }

  onFirstCreate() {
    // Create some starter / tutorial content here
    console.log("Site onFirstCreate");
    let root = this.nodeTree.root;

    let rectNode = this.createNode(gNodeDataMap["RectNode"].nodeClass);
    rectNode.width = 500;
    rectNode.height = 380;
    rectNode.posX = -250;
    rectNode.posY = -185;
    rectNode.background.color.setColorValue('rgba(0, 0, 255, 1.0)');
    root.addChild(rectNode);

    let textNode = this.createNode(gNodeDataMap["TextNode"].nodeClass);
    textNode.text = "hello world";
    textNode.color.setColorValue('rgba(255, 255, 255, 1.0)');
    textNode.fontSize = 72;
    textNode.bold = true;
    textNode.width = 450;
    textNode.posX = -230;
    textNode.posY = -150;
    textNode.textAlign = 'center';
    root.addChild(textNode);

    let tutorialText = this.createNode(gNodeDataMap["TextNode"].nodeClass);
    tutorialText.fontSize = 24;
    tutorialText.color.setColorValue('rgba(255, 255, 255, 1.0)');
    tutorialText.width = 390;
    tutorialText.posX = -195;
    tutorialText.posY = -14;
    tutorialText.textAlign = 'center';
    tutorialText.text = "Use the buttons along the bottom to create things. Go Menu -> Generate Site when you're done.";
    root.addChild(tutorialText);
  }

  async saveSite() {
    try {
      let obj = this.writeToJson();
      let objectHash = hashObject(obj);
      if (this._lastSavedHash === objectHash) {
        // No changes since last save, skip saving
        return;
      }
      
      // Update the last modified time only when we actually save
      this.lastModifiedTime = new Date();
      
      // Regenerate the object with the updated timestamp
      obj = this.writeToJson();
      let jsonStr = prettyJson(obj);
      await this.siteDir.writeTextFile("data.json", jsonStr);
      this._lastSavedHash = hashObject(obj);
      console.log("Saved site!");
    } catch (error) {
      console.error("Failed to save site:", error);
      this.editor.toastError("Failed to save site. Please contact the developer.", {id: 'save-site-failed', details: error});
      throw error;
    }
  }

  static async load(editor, siteId, siteDir) {
    try {
      console.log("Loading site with id: ", siteId);
      let dataFile = await siteDir.findChild("data.json");
      let site = new Site(editor, siteId, siteDir);
      if (dataFile) {
        let jsonStr = await dataFile.readText();
        let siteData = jsonStr.trim() ? JSON.parse(jsonStr) : {};
        console.log("Site data:", prettyJson(siteData));
        site.readFromJson(siteData);
        // Set the _lastSavedHash to avoid an immediate save
        site._lastSavedHash = hashObject(siteData);
        site.fixupNodeIds();
      }
      await site.updateImageFiles();
      return site;
    } catch (error) {
      console.error("Failed to load site:", error);
      this.editor.toastError("Failed to load site. Please contact the developer.", {id: 'load-site-failed', details: error});
      throw error;
    }
  }

  onEnter() {
    // Called when the site is opened for editing
    this.nodeTree.enter();
    
    // Set up file change listener
    this._fileChangeListener = this.editor.fileStorage.onChangeEvt.addListener((changeObj) => {
      // Only update if it's an image file change
      if (changeObj?.name && this._isImageFile(changeObj.name)) {
        this.updateImageFiles();
      }
    });
  }

  onExit() {
    // Called when the site is closed
    this.nodeTree.exit();
    
    // Clean up file change listener
    if (this._fileChangeListener) {
      this.editor.fileStorage.onChangeEvt.removeListener(this._fileChangeListener);
      this._fileChangeListener = null;
    }
    
    // Revoke object URLs to prevent memory leaks
    for (const file of this.imageFiles) {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    }
    this.imageFiles.splice(0, this.imageFiles.length);
  }

  getSiteDir() {
    return this.siteDir;
  }

  getPreferences() {
    return this.preferences;
  }

  hasSelection() {
    return this.selectedItems.length > 0;
  }

  getPrimarySelection() {
    return this.selectedItems.length > 0 ? this.selectedItems[0] : null;
  }

  getSelectedItems() {
    return this.selectedItems;
  }

  _isImageFile(fileName) {
    const lowerFileName = fileName.toLowerCase();
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'];
    return imageExtensions.some(ext => lowerFileName.endsWith(ext));
  }

  async updateImageFiles() {
    try {
      console.log("Updating image files list...");
      // Revoke old object URLs to prevent memory leaks
      for (const file of this.imageFiles) {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      }

      // Get all files from the site directory
      const children = await this.siteDir.getSortedChildren();
      const newImageFiles = [];

      // Filter for image files and create object URLs
      for (const file of children) {
        if (file.isFile() && this._isImageFile(file.getName())) {
          const url = await file.createObjectUrl();
          newImageFiles.push({
            name: file.getName(),
            url: url
          });
        }
      }

      // Replace the imageFiles array
      this.imageFiles.splice(0, this.imageFiles.length, ...newImageFiles);
      console.log(`Updated image files list: ${this.imageFiles.length} images`);
    } catch (error) {
      console.error('Failed to update image files:', error);
    }
  }

  async exportSite() {
    try {
      const zipBlob = await this.siteDir.exportToZip();
      downloadBlobFile(zipBlob, `${this.name || 'site'}_export.zip`);
      console.log('Site exported successfully');
      //this.editor.toastSuccess('Success');
    } catch (error) {
      console.error('Failed to export site:', error);
      this.editor.toastError('Failed to export site. Please contact the developer.', {id: 'export-site-failed', details: error});
      throw error;
    }
  }

  async generateStaticSite() {
    /**
     * Returns a zip blob of the static site.
     */
    try {
      console.log(`Site name: ${this.settings.siteName}`);
      let writer = new StaticSiteWriter(this, this.settings.siteName || 'My Site');

      // Select everything to avoid style-related issues that
      // change the style based on selection state.
      this.deselectAll();

      let faviconExtension = this.settings.faviconSrcName.split('.').pop().toLowerCase();
      let faviconFilename = `favicon.${faviconExtension}`;

      let nodesHtml = await this.nodeTree.generateStaticHtml(writer);
      let indexHtmlStr = StaticIndexHtml;
      indexHtmlStr = indexHtmlStr.replace("{{SITE_TITLE}}", escapeHtml(writer.siteName));
      indexHtmlStr = indexHtmlStr.replace("{{SITE_DESCRIPTION}}", escapeHtml(this.settings.description || ''));
      indexHtmlStr = indexHtmlStr.replace("{{FAVICON_HREF}}", escapeHtml(`/${faviconFilename}`));
      indexHtmlStr = indexHtmlStr.replace("{{MAIN_STYLE_STRING}}",
        stylesDictToInlineString(this.getMainStyleObject()));
      indexHtmlStr = indexHtmlStr.replace("{{CONTENT}}", nodesHtml);
      writer.addTextFile("index.html", indexHtmlStr);
      writer.addStyleBlock('custom', this.customCssString || '');
      console.log("INDEX.HTML:\n", indexHtmlStr);

      // Add a generic robots.txt file
      const robotsTxt = `User-agent: *
Allow: /`;
      writer.addTextFile('robots.txt', robotsTxt);

      await writer.addFileWithName(this.settings.faviconSrcName, faviconFilename);

      // Add the interactive JavaScript file
      writer.addTextFile('interactive.js', StaticInteractiveJs);
      
      let siteBlob = await writer.finalize();
      downloadBlobFile(siteBlob, `${this.name || 'site'}.zip`);
      console.log("Generated static site");
      //gApp.toastSuccess("Success");
    } catch (error) {
      console.error("Failed to generate static site:", error);
      this.editor.toastError("Failed to generate site. Please contact the developer.", {id: 'generate-static-site-failed', details: error});
      throw error;
    }
  }

  deployZip() {
    // TODO
  }

  getSettings() {
    return this.settings;
  }

  getIsEditing() {
    return this.isEditing;
  }

  setIsEditing(newVal) {
    this.isEditing = newVal;
  }

  addToSelection(node) {
    if (!this.selectedItems.includes(node)) {
      this.selectedItems.push(node);
      node.selected = true;
    }
  }

  addManyToSelection(nodes) {
    for (const node of nodes) {
      this.addToSelection(node);
    }
  }

  removeFromSelection(node) {
    const index = this.selectedItems.indexOf(node);
    if (index !== -1) {
      this.selectedItems.splice(index, 1);
      node.selected = false;
    }
  }

  removeManyFromSelection(nodes) {
    for (const node of nodes) {
      this.removeFromSelection(node);
    }
  }

  toggleSelection(node) {
    if (this.selectedItems.includes(node)) {
      this.removeFromSelection(node);
    } else {
      this.addToSelection(node);
    }
  }

  handleNodeClick(node, evt) {
    if (evt.shiftKey) {
      this.addToSelection(node);
    } else if (evt.ctrlKey || evt.metaKey) {
      this.toggleSelection(node);
    } else {
      this.selectNode(node);
    }
  }

  // Selects a single node, deselecting all others
  selectNode(node) {
    this.deselectAll();
    this.addToSelection(node);
  }

  selectMany(nodes) {
    this.deselectAll();
    this.addManyToSelection(nodes);
  }

  deselectAll() {
    this.removeManyFromSelection(this.selectedItems.slice());
  }

  deleteSelectedNodes() {
    let nodesToDelete = this.selectedItems.slice();
    this.deselectAll();
    for (let node of nodesToDelete) {
      if (!node.isRoot()) {
        node.destroy();
      }
    }
  }

  cloneSelected() {
    const selectedNodes = this.getSelectedItems();
    if (selectedNodes.length === 0) {
      return;
    }
    
    // Filter out root nodes (can't be duplicated)
    const duplicatableNodes = selectedNodes.filter(node => !node.isRoot());
    
    if (duplicatableNodes.length > 0) {
      const clonedNodes = [];
      
      // Clone all selected nodes
      for (const node of duplicatableNodes) {
        const clonedNode = node.cloneAndAddAsSibling();
        clonedNodes.push(clonedNode);
      }
      
      // Select all the cloned nodes
      this.selectMany(clonedNodes);
    }
  }

  moveUpSelected() {
    const selectedNodes = this.getSelectedItems();
    if (selectedNodes.length === 0) {
      return;
    }
    
    // Filter out root nodes (can't be moved)
    const movableNodes = selectedNodes.filter(node => !node.isRoot());
    
    // Sort nodes by their tree order to maintain proper ordering
    Node.sortNodesByTreeOrder(movableNodes, this.nodeTree.root);
    
    // Move all selected nodes up
    for (const node of movableNodes) {
      node.moveUp();
    }
  }

  moveDownSelected() {
    const selectedNodes = this.getSelectedItems();
    if (selectedNodes.length === 0) {
      return;
    }
    
    // Filter out root nodes (can't be moved)
    const movableNodes = selectedNodes.filter(node => !node.isRoot());
    
    // Sort nodes by their tree order to maintain proper ordering
    Node.sortNodesByTreeOrder(movableNodes, this.nodeTree.root);
    
    // Move all selected nodes down in reverse order to maintain relative positions
    for (let i = movableNodes.length - 1; i >= 0; i--) {
      movableNodes[i].moveDown();
    }
  }

  groupSelected() {
    const selectedNodes = this.getSelectedItems();
    if (selectedNodes.length < 1) {
      return;
    }
    
    // Filter out root nodes (can't be grouped)
    const groupableNodes = selectedNodes.filter(node => !node.isRoot());
    if (groupableNodes.length < 1) {
      return;
    }
    
    // Sort nodes by their tree order to maintain proper ordering
    Node.sortNodesByTreeOrder(groupableNodes, this.nodeTree.root);
    
    // Create a new group node
    const groupNode = this.createNode(gNodeDataMap["Node"].nodeClass);
    groupNode.name = "Group";
    
    // Find the common parent and get the first node's position
    const firstNode = groupableNodes[0];
    const parentNode = firstNode.parentNode;
    const firstNodeIndex = firstNode.getIndexInParent();
    const firstNodeGlobalPos = firstNode.getGlobalPos();
    
    // Add the group to the parent at the first node's index
    parentNode.addChildAtIndex(groupNode, firstNodeIndex);
    groupNode.setGlobalPos(firstNodeGlobalPos);
    
    // Move all selected nodes into the group, adjusting their positions
    for (const node of groupableNodes) {
      const globalPos = node.getGlobalPos();
      console.log(`Moving node ${node.getAutomaticName()} to group`);
      node.moveToNode(groupNode);
      node.setGlobalPos(globalPos);
    }
    
    // Select the new group
    this.selectNode(groupNode);
  }

  ungroupSelected() {
    const selectedNodes = this.getSelectedItems();
    if (selectedNodes.length !== 1) {
      return; // Need exactly one node selected
    }
    
    const groupNode = selectedNodes[0];
    if (groupNode.isRoot() || groupNode.children.length === 0) {
      return; // Can't ungroup root or empty nodes
    }
    
    const parentNode = groupNode.parentNode;
    if (!parentNode) {
      return; // Can't ungroup root
    }
    
    // Get the group's position in the parent
    const groupIndex = groupNode.getIndexInParent();
    
    // Store the children before we start moving them
    const childrenToMove = [...groupNode.children];
    
    // Move all children to the group's parent at the group's position, preserving global positions
    for (let i = 0; i < childrenToMove.length; i++) {
      const child = childrenToMove[i];
      const globalPos = child.getGlobalPos();
      child.moveToNode(parentNode, groupIndex + i);
      child.setGlobalPos(globalPos);
    }
    
    // Remove the now-empty group
    groupNode.destroy();
    
    // Select the ungrouped nodes
    this.selectMany(childrenToMove);
  }

  selectNodesInRegion(selectionRectangle, evt) {
    /**
     * Select all nodes whose global bounding box overlaps with the selection rectangle.
     * @param {Object} selectionRectangle - Object with {x, y, w, h} properties
     * @param {Event} evt - Mouse event object with modifier keys
     */
    const nodesInRegion = [];
    
    // Iterate through all nodes in the tree to find overlapping ones
    this.nodeTree.root.iterateChildrenDfs((node, depth) => {
      // Skip the root node
      if (node.isRoot()) {
        return true;
      }
      
      // Get the node's global bounding box from the DOM
      const boundingBox = node.getGlobalBoundingBox();
      if (!boundingBox) {
        // If we can't get the bounding box from DOM, skip this node
        return true;
      }
      
      const nodeRect = {
        x: boundingBox.x,
        y: boundingBox.y,
        w: boundingBox.width,
        h: boundingBox.height
      };
      
      // Check if the node's bounding box overlaps with the selection rectangle
      if (RectUtils.doesOverlap(nodeRect, selectionRectangle)) {
        nodesInRegion.push(node);
      }
      
      return true; // Continue visiting children
    });
    
    // Handle selection based on modifier keys
    if (evt.shiftKey) {
      // Add to existing selection
      this.addManyToSelection(nodesInRegion);
    } else if (evt.ctrlKey || evt.metaKey) {
      // Toggle selection for each node
      for (const node of nodesInRegion) {
        this.toggleSelection(node);
      }
    } else {
      // Replace current selection
      this.selectMany(nodesInRegion);
    }
  }

  getPropEditor() {
    return this.getPrimarySelection();
  }

  createNode(nodeClass) {
    console.log("Creating node: ", nodeClass.name);
    let nodeId = this.getNextNodeId();
    let newNode = reactive(new nodeClass(nodeId));
    this.registerNode(newNode);
    newNode.onCreate();
    newNode.applyPreferences(this.preferences);
    return newNode;
  }

  getNextNodeId() {
    return this.nodeIdCtr++;
  }

  registerNode(node) {
    this.nodeLookupMap[node.id] = node;
  }

  unregisterNode(nodeId) {
    delete this.nodeLookupMap[nodeId];
  }

  getNodeById(id) {
    return this.nodeLookupMap[id];
  }

  fixupNodeIds() {
    // Clear the lookup map and rebuild it, fixing any duplicate IDs
    this.nodeLookupMap = {};
    const usedIds = new Set();
    
    // Iterate through all nodes in the tree
    this.nodeTree.root.iterateChildrenDfs((node, depth) => {
      // Check if this ID is already used
      if (usedIds.has(node.id)) {
        // Generate a new unique ID
        node.id = this.getNextNodeId();
        console.log(`Fixed duplicate node ID, assigned new ID: ${node.id}`);
      }
      
      // Register the node in our lookup map
      usedIds.add(node.id);
      this.nodeLookupMap[node.id] = node;
      
      // Update nodeIdCtr to ensure future IDs don't conflict
      if (node.id >= this.nodeIdCtr) {
        this.nodeIdCtr = node.id + 1;
      }
      
      return true; // Continue visiting children
    });
    
    console.log(`Registered ${Object.keys(this.nodeLookupMap).length} nodes in lookup table`);
  }

  updateCanvasSize() {
    console.log("Updating canvas size...");
    const boundingBox = Node.calculateBoundingBoxFromDOM();
    console.log("Bounding box: ", boundingBox);
    if (boundingBox) {
      this.canvasWidth = boundingBox.width;
      this.canvasHeight = boundingBox.height;
    } else {
      this.canvasWidth = kDefaultCanvasWidth;
      this.canvasHeight = kDefaultCanvasHeight;
    }
  }

  getScrollPos() {
    return {x: this.translateX, y: this.translateY};
  }

  getCenterPos() {
    return {x: -this.translateX, y: -this.translateY};
  }

  setCenterPos(pos) {
    this.translateX = -pos.x;
    this.translateY = -pos.y;
  }

  getRootPos() {
    // Returns the root position, which is relative to the canvas (0, 0) [getCenterPos()]
    return this.nodeTree.root.getPos();
  }

  getCenterPosWrtRoot() {
    let centerPos = this.getCenterPos();
    let rootPos = this.getRootPos();
    let targetPos = {
      x: centerPos.x - rootPos.x,
      y: centerPos.y - rootPos.y,
    }
    //console.log(`Center pos: ${centerPos.x}, ${centerPos.y}`);
    //console.log(`Root pos: ${rootPos.x}, ${rootPos.y}`);
    //console.log(`Target pos: ${targetPos.x}, ${targetPos.y}`);
    return targetPos;
  }

  scrollMainBy(offsetX, offsetY) {
    /**
     * Scrolls the main element by the given offset in pixels.
     * @param {number} offsetX - Horizontal scroll offset in pixels
     * @param {number} offsetY - Vertical scroll offset in pixels
     */
    this.translateX -= offsetX;
    this.translateY -= offsetY;
  }
};


export const kAutosaveIntervalSec = 1;

class Editor {
  constructor(router) {
    this.router = router;

    // Note: list of {id, name} per site.
    // When the site is edited, the full site object is loaded.
    this.sites = reactive([]);
    // The site currently being edited
    this.siteRef = ref(null);
    this.siteIdCtr = 1;

    this.userStorage = new UserStorage();
    this.fileStorage = reactive(new FileStorage());

    this.autosaveTimer = new IntervalTimer(() => {
      this.autosaveSite();
    }, kAutosaveIntervalSec, {onlyWhenVisible: true});

    // Set up interval timer to update canvas size
    this.canvasSizeTimer = new IntervalTimer(() => {
      if (this.site) {
        // TODO
        //this.site.updateCanvasSize();
      }
    }, 0.5); // 500ms

    // DEBUG
    router.afterEach((to, from) => {
      console.log(`Route change: ${from} -> ${to}`);
    });
  }

  writeToJson() {
    // Write editor-write data here. Nothing here yet
    return {
      version: "1",
    }
  }
  
  readFromJson(obj) {
    // Note - nothing here yet
  }

  async reloadSites() {
    // Load the list of sites from storage
    try {
      const sitesDir = await this.fileStorage.root.findChild('sites');
      if (!sitesDir || !sitesDir.isDir()) {
        console.log('No sites directory found');
        return;
      }

      const siteChildren = await sitesDir.getChildren();
      const loadedSites = [];
      for (const [dirName, dirObj] of Object.entries(siteChildren)) {
        if (!dirObj.isDir()) {
          continue;
        }
        // Try to parse the directory name as a site ID
        const siteId = parseInt(dirName);
        if (isNaN(siteId)) {
          console.warn(`Skipping invalid site directory: ${dirName}`);
          continue;
        }
        try {
          const dataFile = await dirObj.findChild('data.json');
          if (!dataFile) {
            console.warn(`Site ${siteId} has no data.json, skipping`);
            continue;
          }
          const jsonStr = await dataFile.readText();
          const siteData = jsonStr.trim() ? JSON.parse(jsonStr) : {};
          const siteName = siteData.name;
          // Use the last modified time from the site data, or default to 24 hours ago
          const lastModifiedTime = siteData.lastModifiedTime ?
            new Date(siteData.lastModifiedTime) : new Date(Date.now() - 24 * 60 * 60 * 1000);
          loadedSites.push({
            id: siteId,
            name: siteName,
            lastModifiedTime: lastModifiedTime,
          });
          // Update the site ID counter to avoid conflicts
          if (siteId >= this.siteIdCtr) {
            this.siteIdCtr = siteId + 1;
          }
        } catch (error) {
          console.warn(`Failed to load site ${siteId}:`, error);
          this.toastError(`Failed to load site ${siteId}. Please contact the developer.`, {id: 'load-site-failed', details: error});
        }
      }

      // Sort sites by last modified time (most recent first)
      loadedSites.sort((a, b) => b.lastModifiedTime.getTime() - a.lastModifiedTime.getTime());
      
      // Replace the sites array with loaded sites
      this.sites.splice(0, this.sites.length, ...loadedSites);
      
      console.log(`Loaded ${loadedSites.length} sites`);
    } catch (error) {
      console.error('Failed to load sites:', error);
      this.toastError("Failed to load sites. Please contact the developer.", {id: 'load-sites-failed', details: error});
    }
  }

  async autosaveSite() {
    if (this.site) {
      try {
        await this.site.saveSite();
      } catch (error) {
        console.error("Autosave failed");
      }
    }
  }

  async saveEditorData() {
    try {
      let obj = this.writeToJson();
      let jsonStr = prettyJson(obj);
      let dataFile = await this.fileStorage.root.findChild("app_data.json");
      if (!dataFile) {
        dataFile = await this.fileStorage.root.createFile("app_data.json");
      }
      await dataFile.writeContents(jsonStr);
      console.log("Saved editor:", prettyJson(obj));
    } catch (error) {
      console.error("Failed to save editor:", error);
      this.toastError("Failed to save app data. Please contact the developer.", {id: 'save-editor-failed', details: error});
    }
  }

  async loadEditorData() {
    try {
      let dataFile = await this.fileStorage.root.findChild("app_data.json");
      if (dataFile) {
        let jsonStr = await dataFile.readText();
        let data = JSON.parse(jsonStr);
        this.readFromJson(data);
      }
    } catch (error) {
      console.error("Failed to load editor:", error);
      this.toastError("Failed to load app data. Please contact the developer.", {id: 'load-editor-failed', details: error});
    }
  }

  get site() {
    return this.siteRef.value;
  }

  async start() {
    console.log("Starting JungleWriter...");

    let fileRootDir = await navigator.storage.getDirectory();
    this.fileStorage.setRoot(fileRootDir);

    console.log("Loading editor data...");
    await this.loadEditorData();
    
    console.log("Loading all sites...");
    await this.reloadSites();

    // Set up paste event listener for images
    this._setupPasteListener();

    // Start timers
    this.autosaveTimer.start();
    this.canvasSizeTimer.start();

    console.log("Started");
  }

  _setupPasteListener() {
    window.addEventListener('paste', async (event) => {
      // Only handle paste if we have a site and are in editing mode
      if (!this.site || !this.site.isEditing) {
        return;
      }

      const clipboardItems = event.clipboardData?.items;
      if (!clipboardItems) {
        return;
      }

      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          
          const file = item.getAsFile();
          if (!file) {
            continue;
          }

          try {
            // Generate a unique filename
            const timestamp = Date.now();
            const extension = file.type.split('/')[1] || 'png';
            const filename = `pasted_image_${timestamp}.${extension}`;

            // Save the image file to the site directory
            const imageFile = await this.site.siteDir.createFile(filename);
            await imageFile.writeContents(file);

            // Create a new ImageNode
            let imageNode = this.site.createNode(ImageNode);
            imageNode.setCenterPos(this.site.getCenterPosWrtRoot());
            imageNode.setSrcName(filename);
            this.site.nodeTree.root.addChild(imageNode);
            this.site.selectNode(imageNode);

            console.log(`Created ImageNode for pasted image: ${filename}`);
            break; // Only handle the first image
          } catch (error) {
            console.error('Failed to handle pasted image:', error);
          }
        }
      }
    });
  }

  async createSite(siteName) {
    try {
      let siteId = this.siteIdCtr++;
      let siteDir = await this.fileStorage.root.findOrCreateDir(`sites/${siteId}`);
      let site = reactive(new Site(this, siteId, siteDir));
      site.name = siteName || 'Untitled Site';
      this.sites.unshift({id: site.id, name: site.name, lastModifiedTime: new Date()});
      site.onFirstCreate();
      // Save the site now so that it populates the storage with an entry
      await site.saveSite();
      return site;
    } catch (error) {
      console.error("Failed to create site:", error);
      this.toastError("Failed to create site. Please contact the developer.", {id: 'create-site-failed', details: error});
      throw error;
    }
  }

  async openSiteWithId(siteId) {
    if (this.siteRef.value) {
      // Close any currently open site first
      this.siteRef.value.onExit();
      this.siteRef.value = null;
    }
    try {
      let siteDir = await this.fileStorage.root.findOrCreateDir(`sites/${siteId}`);
      let site = reactive(await Site.load(this, siteId, siteDir));
      this.siteRef.value = site;
      this.siteRef.value.onEnter();
    } catch (error) {
      console.error(`Failed to open site with id ${siteId}:`, error);
      this.toastError("Failed to open site. Please contact the developer.", {id: 'open-site-failed', details: error});
    }
  }

  closeSiteEditor() {
    if (this.siteRef.value) {
      this.siteRef.value.onExit();
      this.siteRef.value = null;
    }
  }

  async importSite(zipBlob) {
    try {
      // Create a new site first
      let site = await this.createSite();
      
      // Import the zip contents into the site directory
      await site.siteDir.importZip(zipBlob);
      
      // Try to load the site data if it exists
      const dataFile = await site.siteDir.findChild('data.json');
      if (dataFile) {
        try {
          const jsonStr = await dataFile.readText();
          const siteData = JSON.parse(jsonStr);
          // Note - Ensure the site keeps its new unique ID
          const originalSiteId = site.id;
          site.readFromJson(siteData);
          site.id = originalSiteId;
          await site.saveSite();
          await this.reloadSites();
        } catch (error) {
          // TODO - toast error here
          console.error('Failed to load site data from imported zip:', error);
        }
      }
      
      console.log('Site imported successfully');
      return site;
    } catch (error) {
      console.error('Failed to import site:', error);
      this.toastError('Failed to import site. Please contact the developer.', {id: 'import-site-failed', details: error});
      throw error;
    }
  }

  toastError(message, opts = {}) {
    console.log("Toast error: ", message, opts);
    gToastManager.toastError(message, opts)
    // TODO - submit to error-handler here, too.
  }

  toastSuccess(message, opts = {}) {
    console.log("Toast success: ", message, opts);
    gToastManager.toastSuccess(message, opts)
  }

  async duplicateSite(siteId) {
    try {
      console.log("Duplicating site with ID:", siteId);
      
      // Find the original site in the sites array
      const originalSiteInfo = this.sites.find(s => s.id === siteId);
      if (!originalSiteInfo) {
        throw new Error(`Site with ID ${siteId} not found`);
      }
      
      // Get the original site directory using the correct path
      const sitesDir = await this.fileStorage.root.findChild('sites');
      if (!sitesDir) {
        throw new Error('Sites directory not found');
      }
      
      const originalSiteDir = await sitesDir.findChild(`${siteId}`);
      if (!originalSiteDir) {
        throw new Error(`Site directory for ID ${siteId} not found`);
      }
      
      // Create a new site ID and directory
      const newSiteId = this.siteIdCtr++;
      const newSiteDir = await sitesDir.createSubDir(`${newSiteId}`);
      
      // Copy all files recursively from the original site directory to the new one
      await originalSiteDir.copyToDirectory(newSiteDir);
      
      // Load the duplicated site to update its ID and name
      const duplicatedSite = await Site.load(this, newSiteId, newSiteDir);
      duplicatedSite.id = newSiteId;
      duplicatedSite.name = `${originalSiteInfo.name} Copy`;
      await duplicatedSite.saveSite();
      
      // Add the new site to the sites array
      this.sites.unshift({
        id: duplicatedSite.id,
        name: duplicatedSite.name,
        lastModifiedTime: new Date(),
      });
      
      console.log(`Duplicated site: ${originalSiteInfo.name} -> ${duplicatedSite.name}`);
      this.toastSuccess(`Duplicated site "${originalSiteInfo.name}"`);
      
      return duplicatedSite;
    } catch (error) {
      console.error('Failed to duplicate site:', error);
      this.toastError('Failed to duplicate site. Please contact the developer.', {
        id: 'duplicate-site-failed',
        details: error
      });
      throw error;
    }
  }

  async exportSite(siteId) {
    try {
      console.log("Exporting site with ID:", siteId);
      
      // Find the site in the sites array
      const siteInfo = this.sites.find(s => s.id === siteId);
      if (!siteInfo) {
        throw new Error(`Site with ID ${siteId} not found`);
      }
      
      // Get the site directory
      const sitesDir = await this.fileStorage.root.findChild('sites');
      if (!sitesDir) {
        throw new Error('Sites directory not found');
      }
      
      const siteDir = await sitesDir.findChild(`${siteId}`);
      if (!siteDir) {
        throw new Error(`Site directory for ID ${siteId} not found`);
      }
      
      // Export the site directory as a zip
      const zipBlob = await siteDir.exportToZip();
      downloadBlobFile(zipBlob, `${siteInfo.name || 'site'}_export.zip`);
      
      console.log(`Exported site: ${siteInfo.name}`);
      this.toastSuccess(`Exported site "${siteInfo.name}"`);
    } catch (error) {
      console.error('Failed to export site:', error);
      this.toastError('Failed to export site. Please contact the developer.', {
        id: 'export-site-failed',
        details: error
      });
      throw error;
    }
  }

  async deleteSite(site) {
    const confirmed = confirm(`Are you sure you want to delete "${site.name || 'Untitled'}"? This action cannot be undone.`);
    if (confirmed) {
      try {
        console.log("Deleting site: ", site);
        // Remove from sites array
        const index = this.sites.findIndex(s => s.id === site.id);
        if (index !== -1) {
          this.sites.splice(index, 1);
        }
        
        // Delete the site directory from storage
        const sitesDir = await this.fileStorage.root.findChild('sites');
        if (sitesDir) {
          await sitesDir.removeChildRecursive(`${site.id}`);
        }
        
        console.log(`Deleted site: ${site.name}`);
        this.toastSuccess(`Deleted site`);
      } catch (error) {
        console.error('Failed to delete site:', error);
        this.toastError('Failed to delete site. Please contact the developer.', {
          id: 'delete-site-failed',
          details: error
        });
      }
    }
  }
};

async function initGlobalApp(router) {
  const app = new Editor(router);
  setGApp(app);
  await app.start();
  return app;
}

export {
  gApp,
  initGlobalApp,
  Post,
  PostsFeed,
};

