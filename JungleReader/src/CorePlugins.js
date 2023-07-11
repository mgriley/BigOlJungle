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

function addRssSuffix(link) {
  if (!link.endsWith(".rss")) {
    return link + ".rss";
  }
  return link;
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
      this.transformRssResult(res)
      feed.updateLinks(res);
    })
  }

  updateFeed(feed) {
    console.log("Updating feed: " + feed.name);
    //const testUrl = "https://www.to-rss.xyz/wikipedia/current_events/"
    this.updateFromRSS(feed, this.transformUrlToRss(feed.url));
  }

  // May override in subclass
  transformUrlToRss(feedUrl) {
    return feedUrl;
  }

  // May override in subclass
  transformRssResult(rssResult) {
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
    return addRssSuffix(feedUrl);
  }

  transformRssResult(rssRes) {
    for (const item of rssRes.items) {
      if (!item.title && !item.description) {
        if (item.contentSnippet) {
          item.description = item.contentSnippet;
        }
      }
    }
  }
}

function extractRssLinkFromHtml(htmlStr) {
  //console.log("Found HTML: " + htmlStr);
  let parser = new DOMParser();
	let doc = parser.parseFromString(htmlStr, 'text/html');
  let linkTag = doc.querySelector("link[title='RSS']");
  if (linkTag === null) {
    throw new Error("Failed to find RSS link tag in the channel's HTML page.");
  }
  return linkTag.getAttribute("href");
}

class YouTubeFeed extends RSSFeed {
  constructor(app) {
    super(app);
    this.name = "YouTube";
    this.urlPlaceholderHelp = "Ex: https://www.youtube.com/@sora_sakurai_en";
    this.quickHelpDocs = "Follow a YouTube channel. Enter a link to the channel";
  }

  updateFeed(feed) {
    // We must extract the RSS link from the html of the link to the homepage
    console.log("Updating feed: " + feed.name + ", " + feed.url);

    function errorOut(errorMsg) {
      feed.isError = true;
      feed.errorMsg = errorMsg;
      console.log(errorMsg);
    }

    let channelUrl = this.app.makeCorsProxyUrl(cleanUrl(feed.url)).toString();
    let plugin = this;
    fetch(channelUrl).then((response) => {
      if (!response.ok) {
        errorOut(`Failed to get: ${channelUrl}. ${reponse.status} ${response.statusText}`);
        return;
      }
      return response.text();
    }).then((htmlStr) => {
      let rssLink = extractRssLinkFromHtml(htmlStr);
      console.log("Extracted RSS link: " + rssLink);
      plugin.updateFromRSS(feed, rssLink);
    }).catch((error) => {
      console.log(error);
      errorOut(error.message);
    });
  }
}

/*
Note: can actually add .rss to any rss entity to create an rss page from it.
*/
class RedditFeed extends RSSFeed {
  constructor(app) {
    super(app);
    this.name = "Reddit";
    this.urlPlaceholderHelp = "Ex: https://www.reddit.com/r/toronto/";
    this.quickHelpDocs = "Follow a subreddit. Enter the link to the subreddit.";
  }

  transformUrlToRss(feedUrl) {
    return addRssSuffix(feedUrl);
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
    new MastodonFeed(app),
    new YouTubeFeed(app),
    new RedditFeed(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

