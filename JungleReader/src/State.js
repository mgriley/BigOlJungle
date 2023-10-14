import { reactive, ref } from 'vue'
import { addElem, removeElem, clearArray,
  replaceArray, curTimeSecs, prettyJson,
  optionsToJson, jsonToOptions, downloadTextFile,
  cleanUrl, isValidUrl, valOr, waitMillis,
  getTimeAgoStr, secsSinceDate, getRandInt } from './Utils.js'
import { registerCorePlugin } from './CorePlugins.js'
import { CustomPlugin } from './PluginLib.js'
import { ContentCache } from './ContentCache.js'

const kReaderVersionString = "0.0";

// LocalStorage keys
const kAppStateKey = "appState";
const kDoneWelcomeKey = "doneWelcome";

var gApp = null;

class Link {
  // Called internally
  constructor(id) {
    this.id = id;
    this.title = "";
    this.link = "";
    this.description = "";
    this.pubDate = null;
    this.extraDataString = null;
  }

  static create() {
    return new Link(gApp.linkIdCtr++);
  }

  writeToJson() {
    return {
      id: this.id,
      link: this.link,
      title: this.title,
      description: this.description,
      pubDate: this.pubDate,
      extraDataString: this.extraDataString,
    }
  }

  readFromJson(obj) {
    this.id = obj.id;
    this.link = obj.link;
    this.title = obj.title;
    this.description = obj.description;
    this.pubDate = obj.pubDate;
    if (obj.extraDataString) {
      this.extraDataString = obj.extraDataString;
    }
  }

  getStringId() {
    return this.url;
  }

  getTrimmedStringDesc(maxLen) {
    maxLen = valOr(maxLen, 200)
    let desc = this.getStringDesc()
    if (desc.length > maxLen) {
      let ellipse = "...";
      desc = desc.substring(0, maxLen - ellipse.length);
      desc += ellipse;
    }
    return desc;
  }

  getStringDesc() {
    // Note: only one of title or description is required in RSS
    if (this.title && this.description) {
      return this.title + ": " + this.description;
    } else if (this.title) {
      return this.title;
    } else if (this.description) {
      return this.description;
    } else if (this.link) {
      return this.link
    }
    return "Link";
  }

  setStarred(newStarred) {
    // TODO
  }

  getSampleHugeString() {
    return "fjkldasj jsdlkjf jsalk jsdlkj sk jlksfa jlkdjsf lkjsd lk jkls jsklf jlkajs lkjsf ljf lkjl sjlk jlk jkl jlk jklj klj l jl kj"
  }
}

class Feed {
  constructor(id) {
    this.id = id;
    this.name = "";
    this.parentGroup = null;
    this.links = []

    this.type = "RSS";
    // This is the feed URL/id
    this.url = "";
    this.options = [];
    this.mainSiteUrl = "";

    this.isError = false;
    this.errorMsg = null;

    // Timestamp of most recent link item
    this.mostRecentLinkTime = 0;

    // Timestamp of when most recently viewed this feed
    this.lastReadTime = 0;

    this.reloading = false;
    // Timestamp of when last reloaded the feed from the source
    this.lastReloadTime = 0;
  }

  static create() {
    return new Feed(gApp.feedIdCtr++);
  }

  static makeShareLink(name, type, url) {
    let params = new URLSearchParams({
      name: name,
      type: type,
      url: url,
    });
    return window.location.origin + "/#/addfeed?" + params.toString();
  }

  writeToJson(contentCache) {
    this.writeLinksToCache(contentCache);
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      url: this.url,
      options: optionsToJson(this.options),
      mainSiteUrl: this.mainSiteUrl,
      isError: this.isError,
      errorMsg: this.errorMsg,
      mostRecentLinkTime: this.mostRecentLinkTime,
      lastReadTime: this.lastReadTime,
      lastReloadTime: this.lastReloadTime
    }
  }

  readFromJson(obj, contentCache) {
    this.id = obj.id;
    this.name = obj.name;
    this.links = this.readLinksFromCache(contentCache);
    this.type = obj.type;
    this.url = obj.url;
    this.options = jsonToOptions(obj.options);
    if (obj.mainSiteUrl) {
      this.mainSiteUrl = obj.mainSiteUrl;
    }
    this.isError = obj.isError;
    this.errorMsg = obj.errorMsg;
    if (obj.mostRecentLinkTime) {
      this.mostRecentLinkTime = obj.mostRecentLinkTime;
    }
    if (obj.lastReadTime) {
      this.lastReadTime = obj.lastReadTime;
    }
    if (obj.lastReloadTime && typeof obj.lastReloadTime === 'number') {
      this.lastReloadTime = obj.lastReloadTime;
    }
  }

  writeLinksToCache(contentCache) {
    let linksData = this.links.map((link) => link.writeToJson());
    contentCache.setItem(`feeds/${this.id}/links`, linksData);
  }

  readLinksFromCache(contentCache) {
    let linksData = contentCache.getItem(`feeds/${this.id}/links`);
    linksData = linksData !== null ? linksData : [];
    return linksData.map((linkObj) => {
      let link = new Link(0);
      link.readFromJson(linkObj)
      return link
    });
  }

  removeFromParent() {
    if (this.parentGroup) {
      this.parentGroup.removeFeed(this);
    }
  }

  isReloading() {
    return this.reloading;
  }

  async reloadIfStale(optMinsUntilStale) {
    let minsUntilStale = valOr(optMinsUntilStale, 30);
    if (this.reloading) {
      return;
    }
    if (secsSinceDate(new Date(this.lastReloadTime)) > minsUntilStale*60) {
      this.reload();
    }
  }

  async reload() {
    if (this.reloading) {
      return;
    }
    let plugin = gApp.getFeedPluginByType(this.type);
    if (!plugin) {
      let errorMsg = `No plugin of type: \"${this.type}\" found.`;
      this.setError(errorMsg);
      return;
    }

    console.log(`Reloading ${this.name}...`);
    this.reloading = true;
    try {
      await plugin.updateFeeds([this]);
    } catch (error) {
      console.log(`Failed to reload ${this.name} with error`, error);
      this.setError(error);
      this.reloading = false;
      return;
    }
    console.log(`Reloaded ${this.name}`)
    this.reloading = false;
    this.lastReloadTime = (new Date()).getTime();
  }

  /**
  Data format:
  {
    items: [
    {
      title: "Some title",
      description: "Something happened", // Optional
      link: "https://mypage.com/thearticle", // Optional,
      pubDate: "<date in pubDate format>", // Optional
      extraDataString: "99 points", // Optional
    },
    ...
    ]
  }
  */
  updateLinks(newLinksData) {
    console.log(`Updating feeds link for "${this.name}"`);
    let existingLinks = {}
    for (const link of this.links) {
      existingLinks[link.stringId] = link;
    }
    // TODO - preserve existing links if possible

    // console.log(`NewLinksData for ${this.url}: ` + prettyJson(newLinksData));
    let mostRecentLinkTime = 0;
    this.links = []
    for (const linkData of newLinksData.items) {
      let newLink = Link.create();
      newLink.title = linkData.title;
      newLink.description = linkData.description;
      newLink.link = linkData.link;
      newLink.pubDate = linkData.pubDate;
      if (linkData.extraDataString) {
        newLink.extraDataString = linkData.extraDataString;
      }
      this.links.push(newLink);

      let pubTime = (new Date(newLink.pubDate)).getTime();
      if (mostRecentLinkTime == 0 || pubTime > mostRecentLinkTime) {
        mostRecentLinkTime = pubTime;
      }
    }
    this.mostRecentLinkTime = mostRecentLinkTime;

    if (newLinksData.link) {
      this.mainSiteUrl = newLinksData.link;
    }

    // Update links in the content cache
    this.writeLinksToCache(gApp.contentCache);

    console.log(`New links for ${this.url}:\n`, this.links);
    this.clearError();
  }

  setError(errorMsg) {
    this.isError = true;
    this.errorMsg = errorMsg;
  }

  clearError() {
    this.isError = false;
    this.errorMsg = "";
  }

  markAsRead() {
    console.log(`Marking as read: "${this.name}"`);
    this.lastReadTime = (new Date()).getTime();
  }

  hasUnreadContent() {
    if (this.mostRecentLinkTime == 0) {
      return false;
    }
    return this.mostRecentLinkTime > this.lastReadTime;
  }

  getMostRecentLinkTime() {
    if (this.mostRecentLinkTime == 0) {
      return null;
    }
    return new Date(this.mostRecentLinkTime);
  }

  mostRecentLinkTimeStr() {
    if (this.mostRecentLinkTime == 0) {
      return "---";
    }
    return getTimeAgoStr(new Date(this.mostRecentLinkTime), {enableMins: true});
  }

  lastReloadTimeStr() {
    if (this.lastReloadTime == 0) {
      return "---";
    }
    return getTimeAgoStr(new Date(this.lastReloadTime), {enableMins: true});
  }

  // It is assumed that the Feed has already been removed its current
  // parent's list of feeds and added to another group's list.
  fixupAfterDrag(newGroup) {
    this.parentGroup = newGroup;
  }

  isVisible() {
    return this.parentGroup !== null ? this.parentGroup.expanded : false;
  }

  moveToGroup(newGroup) {
    this.removeFromParent();
    newGroup.addFeed(this);
  }
}

class FeedGroup {
  constructor(id) {
    this.id = id;
    this.name = "";
    this.feeds = []
    this.expanded = true
  }

  static create() {
    return new FeedGroup(gApp.feedGroupIdCtr++);
  }

  writeToJson(contentCache) {
    return {
      id: this.id,
      name: this.name,
      expanded: this.expanded,
      feeds: this.feeds.map((feed) => feed.writeToJson(contentCache))
    }
  }

  readFromJson(obj, contentCache) {
    this.id = obj["id"]
    this.name = obj["name"]
    this.expanded = obj["expanded"]
    let thisGroup = this;
    this.feeds = obj["feeds"].map((feedObj) => {
      let feed = new Feed(0)
      feed.readFromJson(feedObj, contentCache)
      feed.parentGroup = thisGroup;
      return feed;
    })
  }

  addFeed(feed) {
    this.addFeedAtIndex(feed, this.feeds.length);
  }

  addFeedAtIndex(feed, index) {
    feed.removeFromParent();
    addElem(this.feeds, feed, index);
    feed.parentGroup = this;
  }

  removeFeed(feed) {
    removeElem(this.feeds, feed);
    feed.parentGroup = null;
  }

  isEmpty() {
    return this.feeds.length == 0;
  }
}

class FeedReader {
  constructor() {
    this.groups = reactive([]);
  }

  makeDefaultGroup() {
    let group = FeedGroup.create();
    group.name = "Main";
    this.addFeedGroup(group);
  }

  getGroupWithId(groupId) {
    for (const group of this.groups) {
      if (group.id == groupId) {
        return group;
      }
    }
    return null;
  }

  getFeedWithId(feedId) {
    for (const group of this.groups) {
      for (const feed of group.feeds) {
        if (feed.id == feedId) {
          return feed;
        }
      }
    }
    return null;
  }

  getFeedsOfType(feedType) {
    let feeds = []
    for (const group of this.groups) {
      for (const feed of group.feeds) {
        if (feed.type == feedType) {
          feeds.push(feed);
        }
      }
    }
    return feeds;
  }

  addFeedGroup(feedGroup) {
    this.addFeedGroupAtIndex(feedGroup, this.groups.length);
  }

  addFeedGroupAtIndex(feedGroup, index) {
    addElem(this.groups, feedGroup, index);
  }

  removeFeedGroup(feedGroup) {
    removeElem(this.groups, feedGroup);
  }
}

/*
// TODO
class ProxyInfo {
  constructor() {
    this.url = "";
    // TODO - allow HTTP basic access
    // this.username = 
  }

  writeToJson() {
  }

  readFromJson(obj) {
  }
}
*/

let FetchMethod = {
  JungleExt: 'JungleExt',
  Proxy: 'Proxy',
  DevProxy: 'DevProxy'
};

class JungleReader {
  constructor(toaster, router) {
    this.toaster = toaster;
    this.router = router;

    this.feedGroupIdCtr = 1;
    this.feedIdCtr = 1;
    this.linkIdCtr = 1;

    this.feedReader = new FeedReader();
    this.contentCache = new ContentCache();
    this.starredLinks = [];
    this.linkHistory = [];

    // this.plugins = reactive([])
    this.feedPlugins = reactive([])
    // this.feedTypes = reactive(['RSS', 'Reminder', 'YouTube'])
    this.customPlugins = reactive([])
    this.pluginToEdit = ref(null);

    // TODO - not yet implemented
    this.requiresSave = ref(null);

    // Map reqId -> {resolve, reject}
    this.extReqIdCtr = 1;
    this.pendingExtRequests = {};
    this.isJungleExtPresent = ref(true);

    this.fetchMethod = ref(FetchMethod.JungleExt)

    this.doneWelcome = ref(false);
    this.buttonGenerator = reactive({
      name: "",
      type: "",
      url: ""
    });

    // Register handler for action routes
    this.linkAction = null;
    let app = this;
    this.router.beforeEach((to, from) => {
      // Handle urls that are just supposed to trigger actions
      if (to.name == 'addfeed') {
        console.log("Got 'addfeed' route with query: ", to.query);
        app.linkAction = {name: 'addfeed', args: to.query};
        return {name: 'mainfeed'};
      }
    });
  }

  writeStateToJson() {
    let jsonObj = {
      version: '1',
      feedGroupIdCtr: this.feedGroupIdCtr,
      feedIdCtr: this.feedIdCtr,
      linkIdCtr: this.linkIdCtr,
      groups: this.feedReader.groups.map((group) => group.writeToJson(this.contentCache)),
      customPlugins: this.customPlugins.map((plugin) => plugin.writeToJson()),
      fetchMethod: this.fetchMethod.value,
    }
    return jsonObj;
  }

  readStateFromJson(jsonObj) {
    if ("groups" in jsonObj) {
      let groups = jsonObj["groups"].map((groupObj) => {
        let group = new FeedGroup(0);
        group.readFromJson(groupObj, this.contentCache)
        return group;
      })
      replaceArray(this.feedReader.groups, groups)
    }
    this.feedGroupIdCtr = jsonObj["feedGroupIdCtr"]
    this.feedIdCtr = jsonObj["feedIdCtr"]
    this.linkIdCtr = jsonObj["linkIdCtr"]
    if (jsonObj.customPlugins) {
      let app = this;
      replaceArray(this.customPlugins, jsonObj["customPlugins"].map((pluginObj) => {
        let plugin = new CustomPlugin(app);
        plugin.readFromJson(pluginObj);
        return plugin;
      }))
    }
    this.fetchMethod.value = valOr(jsonObj["fetchMethod"], FetchMethod.JungleExt)
  }

  isDoneWelcome() {
    return this.doneWelcome.value;
  }

  setDoneWelcome(newVal) {
    this.doneWelcome.value = newVal;
    localStorage.setItem(kDoneWelcomeKey, this.doneWelcome.value);
  }

  consumeLinkAction() {
    let action = this.linkAction;
    this.linkAction = null;
    return action;
  }

  getPluginToEdit() {
    return this.pluginToEdit.value;
  }

  setPluginToEdit(plugin) {
    this.pluginToEdit.value = plugin;
  }

  async reloadAllFeeds() {
    // Make a copy of all the current feeds
    let allFeeds = []
    for (const group of this.feedReader.groups) {
      for (const feed of group.feeds) {
        allFeeds.push(feed);
      }
    }

    // Kick off a reload for each one
    console.log("Starting reload all...");
    for (const feed of allFeeds) {
      feed.reloadIfStale(1);
      await waitMillis(50);
    }
    console.log("Done reload all");
  }

  getFeedPluginByType(pluginType) {
    let allPlugins = [...this.feedPlugins, ...this.customPlugins];
    for (const feedPlugin of allPlugins) {
      if (feedPlugin.getFeedType() == pluginType) {
        return feedPlugin;
      }
    }
    return null;
  }

  checkRequiresSave() {
    return this.requiresSave.value;
  }

  saveAll() {
    console.log("Saving Reader");
    let stateData = this.writeStateToJson();
    let jsonData = prettyJson(stateData);
    console.log(jsonData);
    localStorage.setItem(kAppStateKey, jsonData);
    this.cleanContentCache();
    this.toast({message: 'Changes saved!', type: 'success'});
  }

  cleanContentCache() {
    // Remove cache entries for feeds that no longer exist
    let cacheKeys = this.contentCache.getKeys();
    let feedKeys = {};
    for (const cacheKey of cacheKeys) {
      if (cacheKey.startsWith("feeds/")) {
        // feedId -> cacheKey
        feedKeys[cacheKey.split("/")[1]] = cacheKey;
      }
    }
    for (const group of this.feedReader.groups) {
      for (const feed of group.feeds) {
        delete feedKeys[feed.id];
      }
    }
    for (const feedId in feedKeys) {
      console.log("Removing cache entry for deleted feed: ", feedId);
      this.contentCache.removeItem(feedKeys[feedId]);
    }
  }

  exportConfig() {
    console.log("Exporting config")
    let stateData = this.writeStateToJson();
    let jsonData = prettyJson(stateData);
    downloadTextFile(jsonData, "JungleReaderConfig.txt");
  }

  // Returns: true on success, false on failure
  importConfig(configStr) {
    console.log("Importing config");
    let prevConfig = this.writeStateToJson();
    try {
      this.readStateFromJson(JSON.parse(configStr));
    } catch (error) {
      console.error("Error occurred on import config. Falling back to old config.", error);
      this.readStateFromJson(prevConfig);
      return false;
    }
    return true;
  }

  readStateFromStorage() {
    let appState = localStorage.getItem(kAppStateKey);
    if (appState) {
      console.log("Loading from existing data");
      this.readStateFromJson(JSON.parse(appState));
    }
  }

  run() {
    let app = this;

    let doneWelcome = localStorage.getItem(kDoneWelcomeKey);
    this.doneWelcome.value = Boolean(doneWelcome);

    // TODO - trigger error if failed to read this.
    this.readStateFromStorage()

    // Note: this is called when localStorage is modified from another document with this
    // domain (say, another tab)
    window.addEventListener('storage', (evt) => {
      if (evt.key == kAppStateKey) {
        console.log("Updated storage from other page.");
        app.readStateFromStorage();
      }
    });

    // Handle messages from JungleExt
    window.addEventListener('message', (evt) => {
      app.handleWindowMessage(evt);
    });

    registerCorePlugin(this);

    if (this.fetchMethod.value == FetchMethod.JungleExt) {
      this.checkIfJungleExtPresent();
    }
  }

  handleWindowMessage(evt) {
    // console.log("Received window message: ", evt);
    if (!(evt.source == window && evt.data)) {
      console.error("Received unexpected event: ", evt);
      return;
    }
    // Note: handleWindowMessage when we call our own postMessage, so ignore those
    if (!(evt.data.type == "ExtResponse" && evt.data.reqId)) {
      return;
    }
    let requestPromise = this.pendingExtRequests[evt.data.reqId];
    if (!requestPromise) {
      console.error("No request found for reqId: " + evt.data.reqId);
      return;
    }
    delete this.pendingExtRequests[evt.data.reqId];

    let payload = evt.data.payload;
    if (payload.error) {
      requestPromise.reject(new Error(payload.error));
    } else {
      requestPromise.resolve(payload.result);
    }
  }

  async queryExtInfo() {
    return this.makeExtRequest({type: "info", data: {}});
  }

  async fetchTextWithExt(urlString, options) {
    return this.makeExtRequest({type: "fetch", data: {url: urlString, options: options}});
  }

  getDevProxyUrl() {
    return "http://127.0.0.1:8787/corsproxy/";
  }

  makeDevProxyUrl(targetUrl) {
    const url = new URL("http://127.0.0.1:8787/corsproxy/");
    url.searchParams.set("apiurl", cleanUrl(targetUrl));
    return url;
  }

  async fetchTextWithDevProxy(urlString, options) {
    let response = await fetch(this.makeDevProxyUrl(urlString));
    if (!response.ok) {
      throw new Error(`Response error: ${response.statusCode} ${response.statusText}`);
    }
    let text = await response.text();
    return text;
  }

  async fetchText(url, options) {
    let urlString = (typeof url === 'string') ? url : url.toString();
    urlString = cleanUrl(urlString);
    if (!isValidUrl(urlString)) {
      throw new Error(`Tried to fetch from invalid URL: "${urlString}"`);
    }
    if (this.fetchMethod.value == FetchMethod.JungleExt) {
      return this.fetchTextWithExt(urlString, options);
    } else if (this.fetchMethod.value == FetchMethod.Proxy) {
      throw new Error("Not yet impl. Coming soon");
    } else if (this.fetchMethod.value == FetchMethod.DevProxy) {
      return this.fetchTextWithDevProxy(urlString, options);
    } else {
      console.error(`Unknown fetchMethod: "${this.fetchMethod.value}"`);
    }
  }

  async checkIfJungleExtPresent() {
    try {
      // Wait for the extension to load, briefly
      await waitMillis(2000);
      console.log("Checking for JungleExt...");
      let extInfo = await this.makeExtRequest({type: "info", data: {}}, {timeout: 1000});
      this.isJungleExtPresent.value = true;
      console.log("JungleExt found! Info: ", extInfo);
    } catch (error) {
      console.error("JungleExt does not seem to be installed. Please install.");
      this.isJungleExtPresent.value = false;
    }
  }

  // Send a request to the JungleExt WebExtension
  async makeExtRequest(msg, opts) {
    opts = valOr(opts, {});
    let app = this;
    let reqPromise = new Promise((resolve, reject) => {
      let reqId = app.extReqIdCtr++;
      app.pendingExtRequests[reqId] = {resolve: resolve, reject: reject};
      window.postMessage({
        type: "ExtRequest",
        reqId: reqId,
        payload: msg,
      }, location.origin);
      setTimeout(function() {
        let reqPromise = app.pendingExtRequests[reqId];
        if (reqPromise) {
          delete app.pendingExtRequests[reqId];
          reqPromise.reject(new Error("Extension request timed out. Check that the extension is installed."));
        }
      }, valOr(opts.timeout, 10*1000));
    });
    return reqPromise;
  }

  getToaster() {
    return this.toaster;
  }

  toast(toastOpts) {
    return this.toaster.open(toastOpts);
  }
};

function initGlobalReader(toaster, router) {
  gApp = new JungleReader(toaster, router);
  gApp.run();
  return gApp;
}

export {
  gApp,
  initGlobalReader,
  Feed,
  FeedGroup,
  Link,
  getTimeAgoStr,
  FetchMethod,
  kReaderVersionString,
};
