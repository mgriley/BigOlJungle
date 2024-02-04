import { reactive, ref } from 'vue'

export var gApp = null;

export class ImageGallery {
  constructor() {
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

export class App {
  constructor() {
    this.gallery = reactive(new ImageGallery());
    this.poems = reactive(new PostsList());
  }

  run() {
  }
}


export function initGlobalApp(toaster, router) {
  gApp = new App(toaster, router);
  gApp.run();
  return gApp;
}

