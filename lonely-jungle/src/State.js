import { reactive, ref } from 'vue'
import * as ser from 'Shared/SerUtil.js'
import { Peer } from 'peerjs'
import { ReqMap, makePromiseObj, } from './ReqMap.js'

export var gApp = null;

let DEBUG_SERVER_HOST = "localhost";
let DEBUG_SERVER_PORT = 8090;

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
  constructor(username) {
    this.username = username || "";

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
  constructor(toaster, router) {
    this.toaster = toaster;
    this.router = router;

    this.username = null;
    this.userPage = ref(new Page(true));
    this.friendsList = ref(new FriendsList());
    this.pagesCache = ref({})
  }

  initForUser(username) {
    this.username = username;
    this.userPage.value = new Page(true);
    this.friendsList.value = new FriendsList();
    if (this.username == 'user-a') {
      this.friendsList.value.friends = [
        new Friend("user-b"),
        new Friend("user-c"),
      ]
    } else if (this.username == 'user-b') {
      this.friendsList.value.friends = [
        new Friend("user-a"),
        new Friend("user-c"),
      ]
    } else if (this.username == 'user-c') {
      this.friendsList.value.friends = [
        new Friend("user-a"),
        new Friend("user-c"),
      ]
    }
    this.pagesCache.value = {};

    this.peer = new Peer(this.username, {
      host: this.getServerHost(),
      port: this.getServerPort(),
      path: '/peerjs',
      // TODO - change for prod?
      secure: false,
      token: 'mypassword',
      // Show errors and warnings
      debug: 2,
    });
    this.connections = {};
    this.reqMap = new ReqMap();
    this.reqIdCtr = 1;

    this.peer.on('open', (id) => {
      console.log("Peer opened. Connected to the peerjs server with id: " + id);
    });
    this.peer.on('close', () => {
      console.log("Peer closed");
    });
    this.peer.on("disconnected", () => {
      console.log("Peer disconnected from the signalling server.");
      // Note: could call reconnect here if needed
    });
    this.peer.on('connection', (conn) => {
      console.log("Peer received connection: " + conn.peer);
      this.setupConn(conn);
    });
    this.peer.on('error', (err) => {
      console.log("Peer error. ", err);
    });
  }

  getServerHost() {
    return DEBUG_SERVER_HOST;
  }

  getServerPort() {
    return DEBUG_SERVER_PORT;
  }

  goToPage(username) {
    this.router.push({name: "page", params: {id: username}})
  }
  
  async fetchFromPeer(username, req) {
    let connInfo = this.connections[username];
    if (!connInfo) {
      let conn = this.peer.connect(username);
      connInfo = this.setupConn(conn);
      // Do not send messages until the connection is open
      await connInfo.openPromise.wait();
    }
    req.reqId = this.reqIdCtr++;
    connInfo.conn.send(req);
    let res = await this.reqMap.waitResponse(req.reqId, {user: username});
    return res;
  }

  async checkIsOnline(username) {
    let isOnline = null;
    try {
      await this.fetchFromPeer(username, {name: 'IsOnline'})
      isOnline = true;
    } catch (err) {
      console.log("Err. User not online. Specific error:", err);
      isOnline = false;
    }
    return isOnline;
  }

  async loadUserPage(username) {
    if (username in this.pagesCache.value) {
      return this.pagesCache.value[username];
    }
    // Load from the app server
    let page = await this.fetchFromPeer(username, {name: 'page'});
    this.pagesCache.value[username] = page;
    return page;
  }

  setupConn(conn) {
    console.log(`Setting up listeners for conn ${conn.peer}`)
    let connInfo = {
      conn: conn,
      openPromise: makePromiseObj({timeout: 5000}),
    }
    this.connections[conn.peer] = connInfo;

    conn.on('open', () => {
      console.log(`Conn ${conn.peer} open`);
      this.connections.openPromise.resolve();
    });
    conn.on('close', () => {
      console.log(`Conn ${conn.peer} closed`);
      delete this.connections[conn.peer];
    });
    conn.on('error', (err) => {
      console.log(`Conn ${conn.peer} error:`, err);
      // TODO - delete entry?
    });
    conn.on('data', (data) => {
      console.log(`Got data from Conn ${conn.peer}`);
      this.reqMap.registerResponse(data.reqId, data);
    });

    return connInfo;
  }

  run() {
    let defaultUser = 'user-a';
    // TODO - load from storage, maybe
    this.initForUser(defaultUser);
  }

  changeUser(username) {
    console.log("Changing user: " + username);
    this.initForUser(username);
  }
}


export function initGlobalApp(toaster, router) {
  gApp = new App(toaster, router);
  gApp.run();
  return gApp;
}

