import { reactive, ref } from 'vue'
import { addElem, removeElem } from './Utils.js'
import { FeedPlugin } from './PluginLib.js'
import { extendArray } from './Utils.js'
// import Parser from 'rss-parser'

class RSSFeed extends FeedPlugin {
  constructor(app) {
    super("RSS");
    this.app = app;
    this.urlPlaceholderHelp = "Ex: https://www.someurl.com/feed.rss";
    this.quickHelpDocs = "Add an RSS feed with its URL.";
    this.parser = new RSSParser();
  }

  updateFeeds(feeds) {
    for (const feed of feeds) {
      this.updateFeed(feed);
    }
  }

  dumpRSSResult(res) {
    console.log(res.title);
    res.items.forEach(function(entry) {
      console.log(entry.title + ':' + entry.link);
    })
  }

  updateFeed(feed) {
    const url = this.app.makeCorsProxyUrl(
        "https://www.to-rss.xyz/wikipedia/current_events/").toString();
    this.parser.parseURL(url, (err, res) => {
      if (err) {
        console.log("Error parsing RSS URL: " + url);
        feed.isError = true;
        feed.errorMsg = "Error parsing RSS URL:\n" + err;
        return;
      }
      feed.isError = false;
      feed.updateLinks(res);
    })
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

