import { reactive, ref } from 'vue'
import { addElem, removeElem } from './Utils.js'

var gApp = null;

class Link {
  constructor() {
    // TODO
    this.id = gApp.linkIdCtr++;
    this.name = "MyLink";
  }

  setStarred(newStarred) {
    // TODO
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
  }

  removeFromParent() {
    if (this.parentGroup) {
      this.parentGroup.removeFeed(this);
    }
  }

  // It is assumed that the Feed has already been removed its current
  // parent's list of feeds and added to another group's list.
  fixupAfterDrag(newGroup) {
    this.parentGroup = newGroup;
  }

  isVisible() {
    return this.parentGroup !== null ? this.parentGroup.expanded : false;
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

  moveFeed(feed, newIndex) {
  }
}

class FeedReader {
  constructor() {
    this.groups = reactive([])
    this.selectedItem = ref(null);
  }

  makeDefaultGroup() {
    let group = new FeedGroup();
    group.name = "MyGroup";
    this.addFeedGroup(group);
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

  moveFeedGroup(feedGroup, newIndex) {
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
  }

  /*
  openSite() {
  }

  importSite() {
  }
  */
};


gApp = new JungleReader();

export {
  gApp,
  Feed,
  FeedGroup,
  Link
};
