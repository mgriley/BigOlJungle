import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString, prettyJson, countToHumanStr } from './Utils.js'
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
  }

  async updateFeeds(feeds) {
    // TODO - do the async properly
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

  updateFromRSS(feed, rssUrl, optParserOptions) {
    optParserOptions = optParserOptions ?? {};

    rssUrl = cleanUrl(rssUrl);
    if (!isValidUrl(rssUrl)) {
      feed.isError = true;
      feed.errorMsg = `Invalid URL: "${feed.url}"`;
      console.log(`Invalid url for feed ${feed.name}: ${feed.errorMsg}`);
      return;
    }
    const url = this.app.makeCorsProxyUrl(rssUrl).toString();
    let parser = new RSSParser(optParserOptions);
    parser.parseURL(url, (err, res) => {
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
      plugin.updateFromRSS(feed, rssLink, {
        customFields: {
          item: ['media:group'],
        }
      });
    }).catch((error) => {
      console.log(error);
      errorOut(error.message);
    });
  }

  transformRssResult(rssRes) {
    console.log("RSS Res: " + prettyJson(rssRes));
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
    this.urlPlaceholderHelp = "Ex: https://www.reddit.com/r/toronto/";
    this.quickHelpDocs = "Follow a subreddit. Enter the link to the subreddit.";
  }

  transformUrlToRss(feedUrl) {
    return addRssSuffix(feedUrl);
  }
}

class Bookmark extends FeedPlugin {
  constructor(app) {
    super(app)
    this.name = "Bookmark";
    this.urlPlaceholderHelp = "Ex: https://www.somesite.com";
    this.quickHelpDocs = "Add any website address. We cannot generate a full feed but will let you know if the page updated."
  }

  async updateFeeds(feeds) {
    for (const feed of feeds) {
      this.updateFeed(feed);
    }
  }

  updateFeed(feed) {
    // We must extract the RSS link from the html of the link to the homepage
    console.log("Updating feed: " + feed.name + ", " + feed.url);

    function errorOut(errorMsg) {
      feed.isError = true;
      feed.errorMsg = errorMsg;
      console.log(errorMsg);
    }

    // Store a hash of the text content of the page to detect changes
    let plugin = this;
    let siteUrl = this.app.makeCorsProxyUrl(cleanUrl(feed.url)).toString();
    fetch(siteUrl).then((response) => {
      if (!response.ok) {
        errorOut(`Failed to get: ${siteUrl}. ${reponse.status} ${response.statusText}`);
        return;
      }
      return response.text();
    }).then((pageStr) => {
      let pageHash = hashString(pageStr);
      //console.log("PageStr: " + pageStr + ", Hash: " + pageHash);
      let existingHash = feed.getPluginItem("pageHash");
      if (existingHash !== pageHash || feed.isError) {
        feed.setPluginItem("pageHash", pageHash);
        feed.isError = false;
        feed.updateLinks({
          link: feed.url,
          items: [{
            title: "Page updated",
            link: feed.url,
            pubDate: String(new Date()),
          }]
        })
      }
    }).catch((error) => {
      console.log(error);
      errorOut(error.message);
    });
  }
}

export function registerCorePlugin(app) {
  let feedPlugins = [
    new RSSFeed(app),
    new MastodonFeed(app),
    new YouTubeFeed(app),
    new RedditFeed(app),
    new Bookmark(app),
  ];
  extendArray(app.feedPlugins, feedPlugins);
}

