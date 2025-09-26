import { reactive, ref, watchEffect, watch } from 'vue'
import { removeItem, prettyJson, AsyncValue } from './Utils.js'
import { UserStorage } from './UserStorage.js'
import { FileStorage } from './FileStorage.js'
import { gNodeDataMap } from './widgets/NodeDataMap.js'
import { downloadTextFile, downloadBlobFile } from 'Shared/SharedUtils.js'
import { StaticSiteWriter } from './StaticSiteWriter.js'
import {
  StaticIndexHtml, createElementString, stylesDictToInlineString
} from './StaticSiteTemplates.js'

import { NodeTree } from './Node.js'
import { ImageNode } from './widgets/ImageNode.js'
import { ColorInput } from './widgets/ColorInput.js'

import { Marked } from 'marked';
import { gApp, setGApp } from './Globals.js';

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
    this.backgroundColor = new ColorInput('#ffffff', 1.0);
  }

  writeToJson() {
    return {
      backgroundColor: this.backgroundColor.writeToJson(),
    }
  }

  readFromJson(obj) {
    if (obj && obj.backgroundColor) {
      this.backgroundColor.readFromJson(obj.backgroundColor);
    } else {
      this.backgroundColor = new ColorInput('#ffffff', 1.0);
    }
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

  getMainStyleObject() {
    return {
      'background-color': this.settings.backgroundColor.getColorValue(),
    };
  }

  getCanvasStyleObject() {
    let canvasBaseWidth = 600;
    // let canvasAspectRatio = 9.0 / 16.0;
    let canvasAspectRatio = 3.0 / 4.0;
    return {
      '--canvasWidth': canvasBaseWidth + 'px',
      '--canvasHeight': canvasBaseWidth / canvasAspectRatio + 'px',
      'transform': 'scale(1.0)',
    }
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

      // Select everything to avoid style-related issues that
      // change the style based on selection state.
      this.deselectAll();

      let nodesHtml = await this.nodeTree.generateStaticHtml(writer);
      let indexHtmlStr = StaticIndexHtml;
      indexHtmlStr = indexHtmlStr.replace("{{SITE TITLE}}", writer.siteName);
      indexHtmlStr = indexHtmlStr.replace("{{MAIN_STYLE_STRING}}",
        stylesDictToInlineString(this.getMainStyleObject()));
      indexHtmlStr = indexHtmlStr.replace("{{CANVAS_STYLE_STRING}}",
        stylesDictToInlineString(this.getCanvasStyleObject()));
      indexHtmlStr = indexHtmlStr.replace("{{CONTENT}}", nodesHtml);
      writer.addTextFile("index.html", indexHtmlStr);

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

    // Set up paste event listener for images
    this._setupPasteListener();

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
            const imageNode = reactive(new ImageNode());
            imageNode.onCreate();
            imageNode.srcName = filename;
            imageNode.name = `Image (${filename})`;

            // Add the node to the root of the node tree
            this.site.nodeTree.root.addChild(imageNode);

            // Select the newly created node
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
  const app = new Editor(router);
  setGApp(app);
  await app.start();
  return app;
}

export {
  gApp,
  initGlobalApp,
};

