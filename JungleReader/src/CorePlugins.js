import { reactive, ref } from 'vue'
import { addElem, removeElem } from './Utils.js'
import { FeedPlugin } from './PluginLib.js'
import { extendArray } from './Utils.js'
// import Parser from 'rss-parser'

function isValidUrl(urlString) {
  try {
    return Boolean(new URL(urlString));
  } catch (error) {
    return false;
  }
}

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

  updateFromRSS(feed, rssUrl) {
    const url = this.app.makeCorsProxyUrl(rssUrl).toString();
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

  updateFeed(feed) {
    //const testUrl = "https://www.to-rss.xyz/wikipedia/current_events/"
    if (isValidUrl(feed.url)) {
      this.updateFromRSS(feed, feed.url)
    } else {
      feed.isError = true;
      feed.errorMsg = `Invalid URL: "${feed.url}"`;
    }
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

