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

function cleanUrl(link) {
  // Att https if no scheme was given
  return (link.indexOf('://') === -1) ? 'https://' + link : link;
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
    rssUrl = cleanUrl(rssUrl);
    if (!isValidUrl(rssUrl)) {
      feed.isError = true;
      feed.errorMsg = `Invalid URL: "${feed.url}"`;
      console.log(`Invalid url for feed ${feed.name}: ${feed.errorMsg}`);
      return;
    }
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
    console.log("Updating feed: " + feed.name);
    //const testUrl = "https://www.to-rss.xyz/wikipedia/current_events/"
    this.updateFromRSS(feed, this.transformUrlToRss(feed.url));
  }

  // May override in subclasses
  transformUrlToRss(feedUrl) {
    return feedUrl;
  }
}

class MastodonFeed extends RSSFeed {
  constructor(app) {
    super(app);
    this.name = "Mastodon";
    this.urlPlaceholderHelp = "Ex: https://mastodon.social/@someuser";
    this.quickHelpDocs = "Follow a Mastodon feed.";
  }

  transformUrlToRss(feedUrl) {
    // See: https://mastodon.social/@brownpau/100523448408374430
    return feedUrl + ".rss";
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
    new MastodonFeed(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

