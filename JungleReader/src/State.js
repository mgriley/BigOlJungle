import { reactive, ref } from 'vue'
import { addElem, removeElem, clearArray, replaceArray } from './Utils.js'
import { registerCorePlugin } from './CorePlugins.js'

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
      res = "1 hour ago";
    } else {
      res = hoursDiff + " hours ago" 
    }
  }
  return res;
}

class Link {
  constructor() {
    // TODO
    this.id = gApp.linkIdCtr++;
    this.title = "MyLink";
    this.link = "";
    this.description = "";
    this.pubDate = null;
  }

  getStringId() {
    return this.url;
  }

  getStringDesc() {
    let desc = this.getFullStringDesc()
    if (desc.length > 200) {
      desc = desc.substring(0, 200);
      desc += "...";
    }
    return desc;
  }

  getFullStringDesc() {
    // Note: only one of title or description is required in RSS
    if (this.title && this.description) {
      return this.title + ": " + this.description;
    } else if (this.title) {
      return this.title;
    } else {
      return this.description;
    }
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
    this.url = "";
    this.options = [];

    this.isError = false;
    this.errorMsg = null;
  }

  removeFromParent() {
    if (this.parentGroup) {
      this.parentGroup.removeFeed(this);
    }
  }

  updateLinks(newLinksData) {
    let existingLinks = {}
    for (const link of this.links) {
      existingLinks[link.stringId] = link;
    }
    // TODO - preserve existing links if possible

    this.links = []
    for (const linkData of newLinksData.items) {
      let newLink = new Link();
      newLink.title = linkData.title;
      newLink.link = linkData.link;
      newLink.pubDate = linkData.pubDate;
      this.links.push(newLink);
    }

    console.log("New links:");
    console.log(this.links);
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

  writeToJson() {
    // TODO
  }

  readFromJson(obj) {
    // TODO
  }
}

class FeedGroup {
  constructor() {
    this.id = gApp.feedGroupIdCtr++;
    this.name = "MyGroup";
    this.feeds = []
    this.expanded = true
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
    this.feeds = obj["feeds"].map((feedObj) => {
      let feed = new Feed()
      feed.readFromJson(feedObj)
    })
  }
}

/*
class Plugin {
  constructor() {
    this.name = "MyPlugin";
    this.feedPlugins = []
  }
}
*/

class FeedReader {
  constructor() {
    this.groups = reactive([]);
    this.selectedItem = ref(null);
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
  }

  updateFeeds() {
    console.log("updatingFeeds");
    for (const feedPlugin of this.feedPlugins) {
      let feeds = this.feedReader.getFeedsOfType(feedPlugin.name);  
      feedPlugin.updateFeeds(feeds);
    }
  }

  run() {
    let app = this;
    setInterval(function() {
      // Note: only update feeds when tab is in foreground
      if (document.hasFocus()) {
        console.log("Updating feeds");
        app.updateFeeds();
      }
    }, 10000);
  }

  getCorsProxyUrl() {
    return "http://127.0.0.1:8787/corsproxy/";
  }

  makeCorsProxyUrl(targetUrl) {
    const url = new URL("http://127.0.0.1:8787/corsproxy/");
    url.searchParams.set("apiurl", targetUrl);
    return url;
  }

  writeStateToJson() {
    let jsonObj = {
      version: '1',
      feedGroupIdCtr: this.feedGroupIdCtr,
      feedIdCtr: this.feedIdCtr,
      linkIdCtr: this.linkIdCtr,
      groups: this.feedReader.groups.map((group) => group.writeToJson()),
    }
    
    // TODO - starred and history

    return jsonObj;
  }

  readStateFromJson(jsonObj) {
    if ("groups" in jsonObj) {
      let groups = jsonObj["groups"].map((groupObj) => {
        let group = new FeedGroup();
        group.readFromJson(groupObj)
      })
      replaceArray(this.feedReader.groups, groups)
    }
    console.assert("feedGroupIdCtr" in jsonObj)
    console.assert("feedIdCtr" in jsonObj);
    console.assert("linkIdCtr" in jsonObj);
    this.feedGroupIdCtr = jsonObj["feedGroupIdCtr"]
    this.feedIdCtr = jsonObj["feedIdCtr"]
    this.linkIdCtr = jsonObj["linkIdCtr"]
  }

  /*
  openSite() {
  }

  importSite() {
  }
  */
};

gApp = new JungleReader();

registerCorePlugin(gApp);

gApp.run();

export {
  gApp,
  Feed,
  FeedGroup,
  Link,
  getTimeAgoStr
};
