import { reactive, ref } from 'vue'
import { addElem, removeElem } from './Utils.js'
import { FeedPlugin } from './PluginLib.js'
import { extendArray } from './Utils.js'
// import Parser from 'rss-parser'

class RSSFeed extends FeedPlugin {
  constructor() {
    super("RSS");
    this.urlPlaceholderHelp = "Ex: https://www.someurl.com/feed.rss";
    this.quickHelpDocs = "Add an RSS feed with its URL.";
    this.parser = new RSSParser();
  }

  updateFeeds(feeds) {
    for (const feed of feeds) {
      this.updateFeed(feed);
    }
  }

  updateFeed(feed) {
    console.log("Updating: ");  
    console.log(feed);

    this.parser.parseURL(
      "https://cors-anywhere.herokuapp.com/"+
      "https://www.to-rss.xyz/wikipedia/current_events/",
      (err, feed) => {
      if (err) {
        throw err;
      }
      console.log(feed.title);
      feed.items.forEach(function(entry) {
        console.log(entry.title + ':' + entry.link);
      })
    })
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

