import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString, prettyJson, countToHumanStr,
  isValidUrl, cleanUrl, } from './Utils.js'
import { FeedPlugin } from './PluginLib.js'
import { extendArray } from './Utils.js'
import { gApp } from './State.js'
import { parseRsst } from './RssText.js'

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
    this.urlPlaceholderHelp = "Ex: www.someurl.com/feed.rss";
    this.quickHelpDocs = "Follow a RSS feed.";
  }

  async updateFeeds(feeds) {
    for (const feed of feeds) {
      await this.updateFeed(feed);
    }
  }

  dumpRSSResult(res) {
    console.log(res.title);
    res.items.forEach(function(entry) {
      console.log(entry.title + ':' + entry.link);
    })
  }

  async parseRSS(parser, rssText) {
    // Note: convert the callback-based RSS func to a promise
    await new Promise((resolve, reject) => {
      parser.parseString(rssText, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  }

  async updateFromRSS(feed, rssUrl, optParserOptions) {
    optParserOptions = optParserOptions ?? {};
    let rssText = await gApp.fetchText(rssUrl);
    try {
      let res = null;
      if (rssUrl.endsWith(".rsst")) {
        // Handle special rsst file format
        res = parseRsst(rssText);
      } else {
        let parser = new RSSParser(optParserOptions);
        res = await parser.parseString(rssText);
      }
      console.log("Got RSS res:\n", res);
      this.transformRssResult(res)
      feed.updateLinks(res);
    } catch (err) {
      // console.error("Error parsing RSS feed: ", error);
      throw new Error(`Error parsing RSS feed at "${rssUrl}". Detailed Error: ${err}`);
    }
  }

  async updateFeed(feed) {
    console.log("Updating feed: " + feed.name);
    if (!feed.url) {
      throw new Error("The feed URL is not set.");
    }
    //const testUrl = "https://www.to-rss.xyz/wikipedia/current_events/"
    console.log("Updating from RSS");
    let transformedUrl = this.transformUrlToRss(feed.url);
    await this.updateFromRSS(feed, transformedUrl);
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
    this.quickHelpDocs = "Follow a Mastodon page.";
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
    this.urlPlaceholderHelp = "Ex: www.youtube.com/@sora_sakurai_en";
    this.quickHelpDocs = "Follow a YouTube channel.";
  }

  async updateFeed(feed) {
    // We must extract the RSS link from the html of the link to the homepage
    console.log("Updating feed: " + feed.name + ", " + feed.url);
    if (!feed.url) {
      throw new Error("The feed URL is not set.");
    }
    let htmlStr = await gApp.fetchText(feed.url);
    let rssLink = extractRssLinkFromHtml(htmlStr);
    console.log("Extracted RSS link: " + rssLink);
    await this.updateFromRSS(feed, rssLink, {
      customFields: {
        item: ['media:group'],
      }
    });
  }

  transformRssResult(rssRes) {
    // console.log("RSS Res: " + prettyJson(rssRes));
    // We turn the number of views into an extraDataString
    for (const item of rssRes.items) {
      let viewsStr = (item?.["media:group"]?.["media:community"]?.[0]?.
        ["media:statistics"]?.[0]?.["$"]?.["views"]);
      if (viewsStr) {
        item.extraDataString = `${countToHumanStr(parseInt(viewsStr))} views`;
      } else {
        console.log("Failed to find 'views' count in YouTube RSS");
      }
    }
  }
}

/*
Note: can actually add .rss to any rss entity to create an rss page from it.
*/
class RedditFeed extends RSSFeed {
  constructor(app) {
    super(app);
    this.name = "Reddit";
    this.urlPlaceholderHelp = "Ex: www.reddit.com/r/toronto/";
    this.quickHelpDocs = "Follow a Reddit page (subreddit or profile).";
  }

  transformUrlToRss(feedUrl) {
    return addRssSuffix(feedUrl);
  }
}

/*
Bookmark feed have special handling in the reader. When the feed is clicked, we go
to the given link.
*/
class Bookmark extends FeedPlugin {
  constructor(app) {
    super("Bookmark");
    this.app = app;
    this.urlPlaceholderHelp = "Ex: www.somesite.com";
    this.quickHelpDocs = "Add a simple bookmark to any site."
  }

  isBookmarkType() {
    return true;
  }

  async updateFeeds(feeds) {
    // No-op
  }
}

/*
Watcher feeds have special handling in the reader. When the feed is reloaded, it will fetch the page
and check for any changes since the last fetch. This way you can detect when there is anything new there.
*/
class Watcher extends FeedPlugin {
  constructor(app) {
    super("Watcher");
    this.app = app;
    this.urlPlaceholderHelp = "Ex: www.somesite.com/blog";
    this.quickHelpDocs = "Watch any static webpage for changes.";
  }

  isBookmarkType() {
    return true;
  }

  async updateFeeds(feeds) {
    for (const feed of feeds) {
      await this.updateFeed(feed);
    }
  }

  async updateFeed(feed) {
    console.log("Updating feed: " + feed.name + ", " + feed.url);
    if (!feed.url) {
      throw new Error("The feed URL is not set.");
    }
    // Take the hash of the current content and check for changes against the hash from last time
    let contentStr = await gApp.fetchText(feed.url);
    let contentHash = hashString(contentStr).toString(16);

    // Check for no change
    if (feed.links.length > 0 &&
      feed.links[0].description == `Content Hash: ${contentHash}`) {
      // No change detected
      return;
    }

    // Add a 'Change detected' post to the feed
    let newLinksData = {
      link: cleanUrl(feed.url),
      items: []
    };
    newLinksData.items.push({
      title: 'Change detected',
      description: `Content Hash: ${contentHash}`,
      link: cleanUrl(feed.url),
      pubDate: new Date(),
    });
    for (let i = 0; i < Math.min(10, feed.links.length); ++i) {
      let link = feed.links[i];
      newLinksData.items.push({
        title: link.title,
        description: link.description,
        link: link.link,
        pubDate: link.pubDate,
      });
    }
    feed.updateLinks(newLinksData);
  }
};

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
    new MastodonFeed(app),
    new YouTubeFeed(app),
    new RedditFeed(app),
    new Bookmark(app),
    new Watcher(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

