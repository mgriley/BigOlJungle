import { reactive, ref } from 'vue'
import { addElem, removeElem, hashString, prettyJson, countToHumanStr,
  isValidUrl, cleanUrl, parseXml,
  getChild, getChildren, getText, } from './Utils.js'
import { convert } from 'html-to-text'

function htmlToText(htmlStr) {
  let options = {
    //preserveNewlines: true,
    wordwrap: null,
  };
  return convert(htmlStr, options);
}

export class RssParser {
  constructor(options) {
    this.options = options;
  }

  _parseRssV2(obj) {
    let channel = getChild(obj, "channel");
    let parser = this;
    let result = {
      title: getText(channel, "title"),
      description: getText(channel, "description"),
      link: getText(channel, "link"),
      items: getChildren(channel, "item").map((item) => {
        return parser._parseRssItem(item);
      }),
      rawObj: obj,
    };
    return result;
  }

  _parseRssItem(itemObj) {
    let result = {
      guid: getText(itemObj, "guid"),
      link: getText(itemObj, "link"),
      pubDate: getText(itemObj, "pubDate"),
      title: getText(itemObj, "title"),
      description: htmlToText(getText(itemObj, "description")),
      author: getText(itemObj, "author"),
      mediaContent: getChildren(itemObj, "media:content"),
      rawObj: itemObj,
    };
    return result;
  }

  _getAtomFeedLink(obj) {
    let links = getChildren(obj, "link");
    for (const link of links) {
      if (link.attrs["rel"] == "alternate") {
        return link.attrs["href"];
      }
    }
    return null;
  }

  _parseAtomFeed(obj) {
    let parser = this;
    let result = {
      title: getText(obj, "title"),
      description: getText(obj, "subtitle"),
      link: this._getAtomFeedLink(obj),
      items: getChildren(obj, "entry").map((item) => {
        return parser._parseAtomFeedItem(item);
      }),
      rawObj: obj,
    };
    return result;
  }

  _parseAtomFeedItem(itemObj) {
    let result = {
      link: getChild(itemObj, "link")?.attrs["href"],
      pubDate: getText(itemObj, "published"),
      title: getText(itemObj, "title"),
      description: htmlToText(getText(itemObj, "content")),
      rawObj: itemObj,
    };
    return result;
  }

  parseString(rssStr) {
    let feedObj = parseXml(rssStr, 'text/xml');
    console.log("Obj: ", prettyJson(feedObj));

    let result = null;
    if (getChild(feedObj, "rss")) {
      console.log("Parsing as RssV2");
      result = this._parseRssV2(getChild(feedObj, "rss"));
    } else if (getChild(feedObj, "feed")) {
      console.log("Parsing as Atom feed");
      result = this._parseAtomFeed(getChild(feedObj, "feed"));
    } else {
      throw new Error("The RSS feed has an unknown format.", rssStr);
    }
    return result;
  }
};

