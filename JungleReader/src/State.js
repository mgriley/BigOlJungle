import { reactive, ref } from 'vue'
import { addElem, removeElem, clearArray,
  replaceArray, curTimeSecs, prettyJson,
  optionsToJson, jsonToOptions, downloadTextFile,
  cleanUrl } from './Utils.js'
import { registerCorePlugin } from './CorePlugins.js'
import { CustomPlugin } from './PluginLib.js'

// LocalStorage keys
const kAppStateKey = "appState";

// TODO - increase update interval for prod
const kFeedUpdateIntervalSecs = 5;

var gApp = null;

function getTimeAgoStr(date)  {
  let curDate = new Date();    
  let hoursDiff = (curDate.getTime() - date.getTime()) / (1000.0*60*60);
  hoursDiff = Math.floor(hoursDiff);
  let res = null;
  if (hoursDiff > 24) {
    let daysAgo = Math.floor(hoursDiff / 24.0);
    if (daysAgo == 1) {
      res = "1 day ago";
    } else {
      res = daysAgo + " days ago";
    }
  } else {
    if (hoursDiff == 1) {
      res = "1 hr ago";
    } else {
      res = hoursDiff + " hrs ago" 
    }
  }
  return res;
}

class Link {
  constructor() {
    this.id = gApp.linkIdCtr++;
    this.title = "";
    this.link = "";
    this.description = "";
    this.pubDate = null;
    this.extraDataString = null;
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

  getTrimmedStringDesc() {
    let desc = this.getStringDesc()
    if (desc.length > 200) {
      desc = desc.substring(0, 200);
      desc += "...";
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
  constructor() {
    this.id = gApp.feedIdCtr++;
    this.name = "MyFeed";
    this.parentGroup = null;
    this.links = []
    this.expanded = true

    this.type = "RSS";
    // This is the feed URL/id
    this.url = "";
    this.options = [];
    this.mainSiteUrl = "";

    this.isError = false;
    this.errorMsg = null;

    // Some data for the plugin to store on the Feed.
    // map: String -> String
    this.pluginData = {};

    this.mostRecentLinkTime = null;
  }

  writeToJson() {
    return {
      id: this.id,
      name: this.name,
      links: this.links.map((link) => link.writeToJson()),
      expanded: this.expanded,
      type: this.type,
      url: this.url,
      options: optionsToJson(this.options),
      mainSiteUrl: this.mainSiteUrl,
      isError: this.isError,
      errorMsg: this.errorMsg,
      pluginData: {...this.pluginData},
      mostRecentLinkTime: this.mostRecentLinkTime,
    }
  }

  readFromJson(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.links = obj.links.map((linkObj) => {
      let link = new Link();
      link.readFromJson(linkObj)
      return link
    })
    this.expanded = obj.expanded;
    this.type = obj.type;
    this.url = obj.url;
    this.options = jsonToOptions(obj.options);
    if (obj.mainSiteUrl) {
      this.mainSiteUrl = obj.mainSiteUrl;
    }
    this.isError = obj.isError;
    this.errorMsg = obj.errorMsg;
    this.pluginData = obj.pluginData;
    if (obj.mostRecentLinkTime) {
      this.mostRecentLinkTime = obj.mostRecentLinkTime;
    }
  }

  getPluginItem(key) {
    return this.pluginData[key];
  }

  setPluginItem(key, value) {
    this.pluginData[key] = value;
  }

  removeFromParent() {
    if (this.parentGroup) {
      this.parentGroup.removeFeed(this);
    }
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
    let existingLinks = {}
    for (const link of this.links) {
      existingLinks[link.stringId] = link;
    }
    // TODO - preserve existing links if possible

    // console.log(`NewLinksData for ${this.url}: ` + prettyJson(newLinksData));
    let mostRecentLinkTime = null;
    this.links = []
    for (const linkData of newLinksData.items) {
      let newLink = new Link();
      newLink.title = linkData.title;
      newLink.description = linkData.description;
      newLink.link = linkData.link;
      newLink.pubDate = linkData.pubDate;
      if (linkData.extraDataString) {
        newLink.extraDataString = linkData.extraDataString;
      }
      this.links.push(newLink);

      let pubTime = (new Date(newLink.pubDate)).getTime();
      if (mostRecentLinkTime === null || pubTime > mostRecentLinkTime) {
        mostRecentLinkTime = pubTime;
      }
    }
    this.mostRecentLinkTime = mostRecentLinkTime;

    if (newLinksData.link) {
      this.mainSiteUrl = newLinksData.link;
    }

    //console.log(`New links for ${this.url}:`);
    //console.log(this.links);
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

  mostRecentLinkTimeStr() {
    if (this.mostRecentLinkTime === null) {
      return "";
    }
    return "(" + getTimeAgoStr(new Date(this.mostRecentLinkTime)) + ")";
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
  constructor() {
    this.id = gApp.feedGroupIdCtr++;
    this.name = "MyGroup";
    this.feeds = []
    this.expanded = true
  }

  writeToJson() {
    return {
      id: this.id,
      name: this.name,
      expanded: this.expanded,
      feeds: this.feeds.map((feed) => feed.writeToJson())
    }
  }

  readFromJson(obj) {
    this.id = obj["id"]
    this.name = obj["name"]
    this.expanded = obj["expanded"]
    let thisGroup = this;
    this.feeds = obj["feeds"].map((feedObj) => {
      let feed = new Feed()
      feed.readFromJson(feedObj)
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
}

class FeedReader {
  constructor() {
    this.groups = reactive([]);
    this.selectedItem = ref(null);
    this.selectedFeed = ref(null);
  }

  makeDefaultGroup() {
    let group = new FeedGroup();
    group.name = "MyGroup";
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

  getSelectedItem() {
    return this.selectedItem.value;
  }

  setSelectedItem(newItem) {
    this.selectedItem.value = newItem;
  }

  getSelectedFeed() {
    return this.selectedFeed.value;
  }

  setSelectedFeed(feed) {
    this.selectedFeed.value = feed;
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

class JungleReader {
  constructor() {
    this.feedGroupIdCtr = 1;
    this.feedIdCtr = 1;
    this.linkIdCtr = 1;

    this.feedReader = new FeedReader();
    this.starredLinks = [];
    this.linkHistory = [];

    // this.plugins = reactive([])
    this.feedPlugins = reactive([])
    // this.feedTypes = reactive(['RSS', 'Reminder', 'YouTube'])
    this.customPlugins = reactive([])
    this.pluginToEdit = ref(null);

    this.requiresSave = ref(null);

    // Map reqId -> {resolve, reject}
    this.extReqIdCtr = 1;
    this.pendingExtRequests = {};
  }

  writeStateToJson() {
    let jsonObj = {
      version: '1',
      feedGroupIdCtr: this.feedGroupIdCtr,
      feedIdCtr: this.feedIdCtr,
      linkIdCtr: this.linkIdCtr,
      groups: this.feedReader.groups.map((group) => group.writeToJson()),
      customPlugins: this.customPlugins.map((plugin) => plugin.writeToJson()),
    }
    
    // TODO - starred, history, custom plugins

    return jsonObj;
  }

  readStateFromJson(jsonObj) {
    if ("groups" in jsonObj) {
      let groups = jsonObj["groups"].map((groupObj) => {
        let group = new FeedGroup();
        group.readFromJson(groupObj)
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
  }

  getPluginToEdit() {
    return this.pluginToEdit.value;
  }

  setPluginToEdit(plugin) {
    this.pluginToEdit.value = plugin;
  }

  updateFeeds() {
    let feedTypeSet = new Set();
    let allPlugins = [...this.feedPlugins, ...this.customPlugins];
    for (const feedPlugin of allPlugins) {
      if (!feedPlugin.getFeedType()) {
        continue;
      }
      if (feedTypeSet.has(feedPlugin.getFeedType())) {
        console.log("Encountered a second plugin that handles feeds of type: \"" + feedPlugin.getFeedType()
          + "\". This is not supported. Only the first plugin will work.");
      }
      let feeds = this.feedReader.getFeedsOfType(feedPlugin.getFeedType());  
      feeds = feeds.filter((feed) => feed.isVisible());
      // TODO - handle the Promise?
      feedPlugin.updateFeeds(feeds);
      feedTypeSet.add(feedPlugin.getFeedType());
    }
  }

  checkRequiresSave() {
    return this.requiresSave.value;
  }

  saveAll() {
    console.log("Saving Reader");
    let stateData = this.writeStateToJson();
    let jsonData = prettyJson(stateData);
    //console.log(jsonData);
    localStorage.setItem(kAppStateKey, jsonData);
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

    setInterval(function() {
      // Note: only update feeds when tab is in foreground
      if (!document.hasFocus()) {
        return;
      }
      console.log("Updating feeds");
      app.updateFeeds();
    }, kFeedUpdateIntervalSecs*1000);
  }

  getCorsProxyUrl() {
    return "http://127.0.0.1:8787/corsproxy/";
  }

  makeCorsProxyUrl(targetUrl) {
    const url = new URL("http://127.0.0.1:8787/corsproxy/");
    url.searchParams.set("apiurl", cleanUrl(targetUrl));
    return url;
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
    requestPromise.resolve(evt.data.payload);
    delete this.pendingExtRequests[evt.data.reqId];
  }

  async fetchText(url, options) {
    return this.makeExtRequest({type: "fetch", data: {url: url, options: options}});
  }

  // Send a request to the JungleExt WebExtension
  async makeExtRequest(msg) {
    let app = this;
    let reqPromise = new Promise((resolve, reject) => {
      let reqId = app.extReqIdCtr++;
      app.pendingExtRequests[reqId] = {resolve: resolve, reject: reject};
      window.postMessage({
        type: "ExtRequest",
        reqId: reqId,
        payload: msg,
      }, location.origin);
    });
    return reqPromise;
  }
};

gApp = new JungleReader();
gApp.run();

export {
  gApp,
  Feed,
  FeedGroup,
  Link,
  getTimeAgoStr
};
