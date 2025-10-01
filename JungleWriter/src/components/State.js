import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { UserStorage } from './UserStorage.js'
import { FileStorage } from './FileStorage.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import {
  downloadTextFile, downloadBlobFile, IntervalTimer,
  hashObject,
} from 'Shared/SharedUtils.js'
import { StaticSiteWriter } from './StaticSiteWriter.js'
import {
  StaticIndexHtml, createElementString, stylesDictToInlineString
} from './StaticSiteTemplates.js'

import { NodeTree, Node } from './Node.js'
import { ImageNode } from './widgets/ImageNode.js'
import { ColorInput } from './widgets/ColorInput.js'

import { gApp, setGApp } from './Globals.js';
import { Post, PostsFeed } from './Post.js'

class SiteSettings {
  constructor() {
    this.siteName = "";
    this.faviconSrcName = "";
    this.backgroundColor = new ColorInput('#ffffff', 1.0);
    // NOTE - currently unused
    //this.foregroundColor = new ColorInput('#ffffff', 1.0);
    this.canvasWidth = 4000;
    this.canvasHeight = 4000;
    this.enableWASDNavigation = false;
  }

  writeToJson() {
    return {
      siteName: this.siteName,
      faviconSrcName: this.faviconSrcName,
      backgroundColor: this.backgroundColor.writeToJson(),
      //foregroundColor: this.foregroundColor.writeToJson(),
      canvasWidth: this.canvasWidth,
      canvasHeight: this.canvasHeight,
      enableWASDNavigation: this.enableWASDNavigation,
    }
  }

  readFromJson(obj) {
    this.siteName = obj && obj.siteName ? obj.siteName : "";
    this.faviconSrcName = obj && obj.faviconSrcName ? obj.faviconSrcName : "";
    if (obj && obj.backgroundColor) {
      this.backgroundColor.readFromJson(obj.backgroundColor);
    } else {
      this.backgroundColor = new ColorInput('#ffffff', 1.0);
    }
    /*
    if (obj && obj.foregroundColor) {
      this.foregroundColor.readFromJson(obj.foregroundColor);
    } else {
      this.foregroundColor = new ColorInput('#ffffff', 1.0);
    }
    */
    if (obj && obj.canvasWidth) {
      this.canvasWidth = obj.canvasWidth;
    }
    if (obj && obj.canvasHeight) {
      this.canvasHeight = obj.canvasHeight;
    }
    this.enableWASDNavigation = obj && obj.enableWASDNavigation ? obj.enableWASDNavigation : false;
  }
}

class Site {
  constructor(editor, id, siteDir) {
    this.editor = editor;
    this.id = id;
    this.name = "";
    this.version = "1";
    this.nodeTree = new NodeTree();
    this.selectedEntity = null;
    this.settings = new SiteSettings();
    this.isEditing = true;
    this.postsFeed = new PostsFeed();
    this.blogFeed = new PostsFeed();
    this.galleryFeed = new PostsFeed();
    this.filesPageConfig = "";
    this.resolvedFilesDict = {};
    this._lastSavedHash = null;

    this.translateX = 0;
    this.translateY = 0;

    // Node state management
    this.nodeIdCtr = 1;
    this.nodeLookupMap = {};

    // siteDir is the DirObj for the current site, for convenience.
    // It is set from the Editor
    this.siteDir = siteDir;
  }

  writeToJson() {
    let obj = {
      id: this.id,
      name: this.name,
      version: this.version,
      nodeTree: this.nodeTree.writeToJson(),
      settings: this.settings.writeToJson(),
      postsFeed: this.postsFeed.writeToJson(),
      blogFeed: this.blogFeed.writeToJson(),
      galleryFeed: this.galleryFeed.writeToJson(),
      filesPageConfig: this.filesPageConfig,
      nodeIdCtr: this.nodeIdCtr,
    };
    return obj;
  }

  readFromJson(obj) {
    this.id = obj.id;
    this.name = obj.name;
    if ('version' in obj) {
      this.version = obj.version;
    }
    if ('nodeIdCtr' in obj) {
      this.nodeIdCtr = obj.nodeIdCtr;
    }
    this.nodeTree.readFromJson(obj.nodeTree);
    this.settings.readFromJson(obj.settings);
    if ('postsFeed' in obj) {
      this.postsFeed.readFromJson(obj.postsFeed);
    }
    if ('blogFeed' in obj) {
      this.blogFeed.readFromJson(obj.blogFeed);
    }
    if ('galleryFeed' in obj) {
      this.galleryFeed.readFromJson(obj.galleryFeed);
    }
    this.filesPageConfig = obj.filesPageConfig || "";
  }

  getMainStyleObject() {
    // TODO - fix this up
    /*
    let canvasBaseWidth = 600;
    // let canvasAspectRatio = 9.0 / 16.0;
    let canvasAspectRatio = 3.0 / 4.0;
    let canvasStyleObj = {
      //'background-color': this.settings.foregroundColor.getColorValue(),
      '--canvasWidth': canvasBaseWidth + 'px',
      '--canvasHeight': canvasBaseWidth / canvasAspectRatio + 'px',
      'transform': 'scale(1.0)',
    }
    */
    let canvasWidth = this.settings.canvasWidth;
    let canvasHeight = this.settings.canvasHeight;
    return {
      'background-color': this.settings.backgroundColor.getColorValue(),
      '--translateX': this.translateX + 'px',
      '--translateY': this.translateY + 'px',
      '--design-guide-color': 'white',
      //'--canvasWidth': canvasWidth + 'px',
      //'--canvasHeight': canvasHeight + 'px',
    };
  }

  async saveSite() {
    try {
      let obj = this.writeToJson();
      let objectHash = hashObject(obj);
      if (this._lastSavedHash === objectHash) {
        // No changes since last save, skip saving
        console.log("No changes since last save, skipping save");
        return;
      }
      let jsonStr = prettyJson(obj);
      await this.siteSite.writeTextFile("data.json", jsonStr);
      this._lastSavedHash = objectHash;
      console.log("Saved site:", prettyJson(obj));
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
        let siteData = JSON.parse(jsonStr);
        console.log("Site data:", prettyJson(siteData));
        site.readFromJson(siteData);
        site.fixupNodeIds();
      }
      return site;
    } catch (error) {
      console.error("Failed to load site:", error);
      this.editor.toastError("Failed to load site. Please contact the developer.", {id: 'load-site-failed', details: error});
      throw error;
    }
  }

  getSiteDir() {
    return this.siteDir;
  }

  async exportSite() {
    try {
      const zipBlob = await this.siteDir.exportToZip();
      downloadBlobFile(zipBlob, `${this.name || 'site'}_export.zip`);
      console.log('Site exported successfully');
      this.editor.toastSuccess('Success');
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
      indexHtmlStr = indexHtmlStr.replace("{{SITE_TITLE}}", writer.siteName);
      indexHtmlStr = indexHtmlStr.replace("{{FAVICON_HREF}}", `/${faviconFilename}`);
      indexHtmlStr = indexHtmlStr.replace("{{MAIN_STYLE_STRING}}",
        stylesDictToInlineString(this.getMainStyleObject()));
      indexHtmlStr = indexHtmlStr.replace("{{CONTENT}}", nodesHtml);
      writer.addTextFile("index.html", indexHtmlStr);

      await writer.addFileWithName(this.settings.faviconSrcName, faviconFilename);

      let siteBlob = await writer.finalize();
      downloadBlobFile(siteBlob, `${this.name || 'site'}.zip`);
      console.log("Generated static site");
      gApp.toastSuccess("Success");
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

  async getBlobUrlMap() {
    // TODO - should probs cache these, but fine for now
    let blobUrlMap = {};
    let fileObjs = await this.siteDir.getSortedChildren();
    for (const fileObj of fileObjs) {
      if (fileObj.isFile()) {
        blobUrlMap[fileObj.getName()] = await fileObj.createObjectUrl();
      }
    }
    console.log("BlobUrlMap: " + prettyJson(blobUrlMap));
    return blobUrlMap;
  }

  getSelectedNode() {
    return this.selectedEntity;
  }

  selectNode(node) {
    if (this.selectedEntity) {
      this.selectedEntity.selected = false;
    }
    this.selectedEntity = node;
    console.log("Selected node: " + (node ? node.name : "null"));
    if (node) {
      node.selected = true;
    }
  }

  deselectAll() {
    if (this.selectedEntity) {
      this.selectedEntity.selected = false;
    }
    this.selectedEntity = null;
  }

  deleteSelectedNodes() {
    if (this.selectedEntity) {
      this.selectedEntity.destroy();
      this.selectedEntity = null;
    }
  }

  getPropEditor() {
    return this.selectedEntity;
  }

  createNode(nodeClass) {
    let nodeId = this.getNextNodeId();
    let newNode = reactive(new nodeClass(nodeId));
    this.registerNode(newNode);
    newNode.onCreate();
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
      if (this.site) {
        this.saveSite();
      }
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
          const siteData = JSON.parse(jsonStr);
          const siteName = siteData.name || `Site ${siteId}`;

          loadedSites.push({
            id: siteId,
            name: siteName,
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

      // Sort sites by ID (newest first)
      loadedSites.sort((a, b) => b.id - a.id);
      
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

    // Trigger this event to get the Nodes that depend on the FileStorage setup properly
    //this.fileStorage.onChangeEvt.emit();

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
      this.sites.unshift({id: site.id, name: site.name});
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
    try {
      let siteDir = await this.fileStorage.root.findOrCreateDir(`sites/${siteId}`);
      let site = reactive(await Site.load(this, siteId, siteDir));
      this.siteRef.value = site;
      // Emit a FS evt so that any FS-dependent nodes like ImageNode can setup
      this.fileStorage.onChangeEvt.emit();
    } catch (error) {
      console.error(`Failed to open site with id ${siteId}:`, error);
      this.toastError("Failed to open site. Please contact the developer.", {id: 'open-site-failed', details: error});
    }
  }

  deselectSite() {
    this.siteRef.value = null;
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

  toastError(message, opts) {
    // TODO
  }

  toastSuccess(message, opts) {
    // TODO
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

