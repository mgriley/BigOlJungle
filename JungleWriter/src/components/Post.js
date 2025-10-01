import { Marked } from 'marked';
import { gApp, setGApp } from './Globals.js';

/**
 * NOTE - these classes are not currently used.
 * They were made for a potential RSS / posting feature. Maybe will get to this later.
 */

export class Post {
  constructor() {
    /*
    this.body = "";
    this.imgSrc = null;
    */
    this.title = "";
    this.date = new Date();
    this.markdown = "";
    this.renderedMarkdown = "";
  }

  writeToJson() {
    return {
      //body: this.body,
      //imgSrc: this.imgSrc,
      title: this.title,
      date: this.date.getTime(),
      markdown: this.markdown,
      renderedMarkdown: this.renderedMarkdown,
    };
  }

  readFromJson(obj) {
    /*
    this.body = obj.body;
    this.imgSrc = obj.imgSrc;
    */
    this.title = obj.title || "";
    this.date = new Date(obj.date);
    this.markdown = obj.markdown || "";
    this.renderedMarkdown = obj.renderedMarkdown || "";
  }

  dateString() {
    const options = {
      weekday: 'short',
      //year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return this.date.toLocaleDateString(undefined, options);
  }

  async renderMarkdown() {
    // We have to replace the img srcs with the blob URLs of the img files, for
    // any such imgs.
    // TODO - this method no longer exists
    let blobUrlMap = await gApp.site.getBlobUrlMap();
    const renderer = {
      image(href, title, text) {
        console.log("Processing img: " + href);
        if (href in blobUrlMap) {
          let newHref = blobUrlMap[href];
          console.log("Fixing up to: " + newHref);
          return `<img src="${newHref}" alt="${text}" title="${title}"></img>`
        } else {
          // Fallback to default renderer
          return false;
        }
      }
    };
    let marked = new Marked({
      renderer: renderer
    });
    this.renderedMarkdown = marked.parse(this.markdown);
  }
}

export class PostsFeed {
  constructor() {
    this.posts = [];
  }

  writeToJson() {
    return {
      posts: this.posts.map((post) => {
        return post.writeToJson();
      })
    }
  }

  readFromJson(obj) {
    this.posts = obj.posts.map((postObj) => {
      let post = new Post();
      post.readFromJson(postObj);
      return post;
    });
  }
}