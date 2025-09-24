import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { UserStorage } from './UserStorage.js'
import { FileStorage } from './FileStorage.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import { downloadTextFile, downloadBlobFile } from 'Shared/SharedUtils.js'
import { StaticSiteWriter } from './StaticSiteWriter.js'
import { StaticIndexHtml } from './StaticSiteTemplates.js'

import { Marked } from 'marked';

var gApp = null;

var gState = {
  nodeIdCtr: 1,
  nodeLookupMap: {},
};

class Node {
  static sUiShortName = "G";

  constructor() {
    this.id = gState.nodeIdCtr++;
    gState.nodeLookupMap[this.id] = this;
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
      this.addChild(childNode);
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
    delete gState.nodeLookupMap[this.id];
  }

  static getNodeById(id) {
    return gState.nodeLookupMap[id];
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
      this.children.push(childNode);
    }
    childNode.parentNode = this;
  }

  removeFromParent() {
    if (this.parentNode !== null) {
      removeItem(this.parentNode.children, this);
      this.parentNode = this;
    }
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

  async generateStaticHtml(writer) {
    /**
     * Write HTML for this node to the proper place in the static site using
     * the given StaticSiteWriter.
     * 
     * Override in subclasses as needed.
     */
    // TODO
    return `<p>Hello world!</p>`;
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

class NodeTree {
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

  async generateStaticSite(writer) {
    let staticHtml = await this.root.generateStaticHtml(writer);
    let indexHtmlStr = StaticIndexHtml;
    indexHtmlStr = indexHtmlStr.replace("{{SITE TITLE}}", writer.siteName);
    indexHtmlStr = indexHtmlStr.replace("{{CONTENT}}", staticHtml);
    writer.addTextFile("index.html", indexHtmlStr);
  }
};

export class Post {
  constructor() {
    /*
    this.body = "";
    this.imgSrc = null;
    */
    this.title = "";
    this.date = new Date();
    this.markdown = "";
    this.renderedMarkdown = "";
  }

  writeToJson() {
    return {
      //body: this.body,
      //imgSrc: this.imgSrc,
      title: this.title,
      date: this.date.getTime(),
      markdown: this.markdown,
      renderedMarkdown: this.renderedMarkdown,
    };
  }

  readFromJson(obj) {
    /*
    this.body = obj.body;
    this.imgSrc = obj.imgSrc;
    */
    this.title = obj.title || "";
    this.date = new Date(obj.date);
    this.markdown = obj.markdown || "";
    this.renderedMarkdown = obj.renderedMarkdown || "";
  }

  dateString() {
    const options = {
      weekday: 'short',
      //year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return this.date.toLocaleDateString(undefined, options);
  }

  async renderMarkdown() {
    // We have to replace the img srcs with the blob URLs of the img files, for
    // any such imgs.
    let blobUrlMap = await gApp.site.getBlobUrlMap();
    const renderer = {
      image(href, title, text) {
        console.log("Processing img: " + href);
        if (href in blobUrlMap) {
          let newHref = blobUrlMap[href];
          console.log("Fixing up to: " + newHref);
          return `<img src="${newHref}" alt="${text}" title="${title}"></img>`
        } else {
          // Fallback to default renderer
          return false;
        }
      }
    };
    let marked = new Marked({
      renderer: renderer
    });
    this.renderedMarkdown = marked.parse(this.markdown);
  }
}

class PostsFeed {
  constructor() {
    this.posts = [];
  }

  writeToJson() {
    return {
      posts: this.posts.map((post) => {
        return post.writeToJson();
      })
    }
  }

  readFromJson(obj) {
    this.posts = obj.posts.map((postObj) => {
      let post = new Post();
      post.readFromJson(postObj);
      return post;
    });
  }
}

class SiteSettings {
  constructor() {
    this.backgroundColor = "rgb(255, 255, 255)";
  }

  writeToJson() {
    return {
      backgroundColor: this.backgroundColor,
    }
  }

  readFromJson(obj) {
    this.backgroundColor = obj.backgroundColor;
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

    // TODO - store the id of the site that was editing last

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
    };
    return obj;
  }

  readFromJson(obj) {
    this.id = obj.id;
    this.name = obj.name;
    if ('version' in obj) {
      this.version = obj.version;
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

  async save() {
    // TODO - handle errors
    let obj = this.writeToJson();
    let jsonStr = prettyJson(obj);
    let dataFile = await this.siteDir.findChild("data.json");
    if (!dataFile) {
      dataFile = await this.siteDir.createFile("data.json");
    }
    await dataFile.writeContents(jsonStr);
    console.log("Saved site:", prettyJson(obj));
  }

  static async load(editor, siteId, siteDir) {
    // TODO - handle errors
    console.log("Loading site with id: ", siteId);
    let dataFile = await siteDir.findChild("data.json");
    let site = new Site(editor, siteId, siteDir);
    if (dataFile) {
      let jsonStr = await dataFile.readText();
      let siteData = JSON.parse(jsonStr);
      console.log("Site data:", prettyJson(siteData));
      site.readFromJson(siteData);
    }
    return site;
  }

  getSiteDir() {
    return this.siteDir;
  }

  async exportSite() {
    try {
      const zipBlob = await this.siteDir.exportToZip();
      downloadBlobFile(zipBlob, `${this.name || 'site'}_export.zip`);
      console.log('Site exported successfully');
    } catch (error) {
      console.error('Failed to export site:', error);
    }
  }

  async generateStaticSite() {
    /**
     * Returns a zip blob of the static site.
     */
    try {
      let writer = new StaticSiteWriter(this.name || 'site');

      await this.nodeTree.generateStaticSite(writer);

      let siteBlob = await writer.finalize();
      downloadBlobFile(siteBlob, `${this.name || 'site'}.zip`);
      console.log("Generated static site");
    } catch (error) {
      console.error("Failed to generate static site:", error);
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
    console.log("SelectedNode!");
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
};

class Editor {
  constructor(router) {
    this.router = router;

    // Note: list of {id, name, ptr} per site.
    // When the site is edited, the full site object is loaded.
    this.sites = reactive([]);
    // The site currently being edited
    this.siteRef = ref(null);
    this.siteIdCtr = 1;

    this.userStorage = new UserStorage();
    this.fileStorage = reactive(new FileStorage());

    // TODO - debug
    router.afterEach((to, from) => {
      console.log(`Route change: ${from} -> ${to}`);
    });
  }

  writeToJson() {
    return {
      version: "1",
      sites: this.sites.map((site) => {
        return {id: site.id, name: site.name, ptr: null};
      }), 
      siteIdCtr: this.siteIdCtr,
    }
  }
  
  readFromJson(obj) {
    for (const site of obj.sites) {
      this.sites.push(site);
    }
    this.siteIdCtr = obj.siteIdCtr;
  }

  async save() {
    // TODO - handle errors
    let obj = this.writeToJson();
    let jsonStr = prettyJson(obj);
    let dataFile = await this.fileStorage.root.findChild("app_data.json");
    if (!dataFile) {
      dataFile = await this.fileStorage.root.createFile("app_data.json");
    }
    await dataFile.writeContents(jsonStr);
    console.log("Saved app:", prettyJson(obj));
  }

  async load() {
    // TODO - handle errors
    let dataFile = await this.fileStorage.root.findChild("app_data.json");
    if (dataFile) {
      let jsonStr = await dataFile.readText();
      let data = JSON.parse(jsonStr);
      this.readFromJson(data);
    }
  }

  get site() {
    return this.siteRef.value;
  }

  async start() {
    console.log("Starting JungleWriter...");

    let fileRootDir = await navigator.storage.getDirectory();
    this.fileStorage.setRoot(fileRootDir);

    console.log("Loading app...");
    await this.load();

    // Trigger this event to get the Nodes that depend on the FileStorage setup properly
    //this.fileStorage.onChangeEvt.emit();

    console.log("Started");
  }

  async createSite() {
    let siteId = this.siteIdCtr++;
    let siteDir = await this.fileStorage.root.findOrCreateDir(`sites/${siteId}`);
    let site = reactive(new Site(this, siteId, siteDir));
    this.sites.unshift({id: site.id, name: site.name, ptr: site});
    // Save the site now so that it populates the storage with an entry
    site.save();
    this.save();
    return site;
  }

  async loadSiteWithId(siteId) {
    for (const site of this.sites) {
      if (site.id == siteId) {
        if (!site.ptr) {
          let siteDir = await this.fileStorage.root.findOrCreateDir(`sites/${siteId}`);
          site.ptr = reactive(await Site.load(this, site.id, siteDir));
        }
        return site.ptr;
      }
    }
    return null;
  }

  changeSiteName(siteId, newName) {
    for (const site of this.sites) {
      if (site.id == siteId) {
        site.name = newName;
        return;
      }
    }
    throw new Error("Site with that id not found");
  }
  
  async selectSiteById(siteId) {
    let site = await this.loadSiteWithId(siteId);
    this.siteRef.value = site;
    // Emit a FS evt so that any FS-dependent nodes like ImageNode can setup
    this.fileStorage.onChangeEvt.emit();
  }

  deselectSite() {
    this.siteRef.value = null;
  }

  openSite() {
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
          
          // Store the original site ID before reading from JSON
          const originalSiteId = site.id;
          
          site.readFromJson(siteData);
          
          // Ensure the site keeps its new unique ID
          site.id = originalSiteId;
          
          // Update the site name in the sites list
          for (const siteEntry of this.sites) {
            if (siteEntry.id === site.id) {
              siteEntry.name = site.name;
              break;
            }
          }

          // Save the site after importing
          await site.save();
        } catch (error) {
          console.warn('Failed to load site data from imported zip:', error);
        }
      }
      
      await this.save();
      console.log('Site imported successfully');
      return site;
    } catch (error) {
      console.error('Failed to import site:', error);
      throw error;
    }
  }
};

async function initGlobalApp(router) {
  gApp = new Editor(router);
  await gApp.start();
  return gApp;
}

export {
  gApp,
  initGlobalApp,
  Node
};

