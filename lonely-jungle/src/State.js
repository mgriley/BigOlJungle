import { reactive, ref } from 'vue'
import * as ser from 'Shared/SerUtil.js'

export var gApp = null;

export class ImageGallery {
  constructor() {
    // TODO
  }
}

export class Post {
  constructor() {
    this.title = "";
    this.date = new Date();
    this.body = "";
    // this.renderedMarkdown = "";
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

  /*
  async renderMarkdown() {
    // We have to replace the img srcs with the blob URLs of the img files, for
    // any such imgs.
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
  */
}

export class PostsList {
  constructor() {
    this.posts = []
  }
};

export class Page {
  constructor(editable) {
    this.editable = editable;

    this.title = "Your Page";
    this.description = "Describe yourself and your work here."
    this.statusUpdate = new Post();
    this.paintings = new ImageGallery();
    this.photos = new ImageGallery();
    this.poems = new PostsList();

    // TODO - outbound links (reccs)
    // Link + description
  }
};

export class Friend {
  constructor() {
    this.pageName = "";
    this.chatMsgs = [];
    this.lastSeenOnline = new Date();
    this.lastVisited = new Date();

    this.lastNewStatus = new Date();
    // TODO - may need lastMsgTime, per user
    this.isOnline = false;
  }
}

export class FriendsList {
  constructor() {
    this.friends = [];
  }
};

export class App {
  constructor() {
    this.userPage = reactive(new Page(true));
  }

  run() {
  }
}


export function initGlobalApp(toaster, router) {
  gApp = new App(toaster, router);
  gApp.run();
  return gApp;
}

