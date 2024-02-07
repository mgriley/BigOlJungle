import { reactive, ref } from 'vue'
import { prettyJson, } from './Utils.js'
import * as ser from 'Shared/SerUtil.js'
import { AutosaveTimer } from 'Shared/AutosaveTimer.js'
import { Peer } from 'peerjs'
import { ReqMap, makePromiseObj, } from './ReqMap.js'

export var gApp = null;

let APP_STORAGE_KEY = "appState";

let DEBUG_SERVER_HOST = "localhost";
let DEBUG_SERVER_PORT = 8090;

export class ImageGallery {
  constructor() {
    // TODO

    this.serFields = []
  }
}

export class Post {
  constructor() {
    this.title = "";
    this.date = new Date();
    this.body = "";
    // this.renderedMarkdown = "";

    this.serFields = [
      'title',
      {name: 'date', type: 'Date'},
      'body',
    ]
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

    this.serFields = [
      {
        name: 'posts',
        type: 'ObjArray',
        elemCtor: () => {
          return new Post();
        },
      },
    ]
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

    this.serFields = [
      'title',
      'description',
      'statusUpdate',
      'paintings',
      'photos',
      'poems',
    ]
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

    this.autosaveTimer = new AutosaveTimer(15, () => {
      this.onAutosave();
    })

    this.reqIdCtr = 1;
  }

  writeUserToJson() {
    return {
      userPage: ser.writeToJson(this.userPage.value),
      friendsList: ser.writeToJson(this.friendsList.value),
    }
  }

  readUserFromJson(userData) {
    ser.readUserFromJson(this.userPage.value, userData.userPage)
    ser.readFromJson(this.friendsList.value, userData.friendsList)
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

    if (this.peer) {
      this.peer.destroy();
    }
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
      console.log(`User ${username} confirmed online`);
    } catch (err) {
      console.log("Err. User not online. Specific error:", err);
      isOnline = false;
    }
    return isOnline;
  }

  async loadUserPage(username) {
    if (username in this.pagesCache.value) {
      console.log("Found in cache");
      return this.pagesCache.value[username];
    }
    // Load from the app server
    let pageRes = await this.fetchFromPeer(username, {name: 'GetPage'});
    console.log("Got pageRes: ", pageRes);
    let page = reactive(new Page(false));
    ser.readFromJson(page, pageRes.page)
    // TODO - impl cache properly later
    //this.pagesCache.value[username] = page;
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
      connInfo.openPromise.resolve();
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
      console.log(`Got data from Conn ${conn.peer}: `, data);
      if (data.isResponse) {
        // TODO - pass in the user and make sure matches, too.
        this.reqMap.registerResponse(data.reqId, data);
      } else {
        if (!('name' in data)) {
          console.log("Unknown data, no name: ", data);
          return;
        }
        if (data.name == "IsOnline") {
          conn.send({
            name: data.name,
            reqId: data.reqId,
            isResponse: true,
          })
        } else if (data.name == "GetPage") {
          let pageData = ser.writeToJson(this.userPage.value);
          console.log("My page data: ", prettyJson(pageData));
          conn.send({
            name: data.name,
            reqId: data.reqId,
            isResponse: true,
            page: pageData,
          })
        } else {
          console.log("Unknown request name: " + data.name);
        }
      }
    });

    return connInfo;
  }

  run() {
    // let debugUser = 'user-a';
    let debugUser = 'user-a';
    console.log("Host: " + window.location.host);
    if (window.location.host == "localhost:5175") {
      debugUser = "user-a";
    } else if (window.location.host == "localhost:5176") {
      debugUser = "user-b";
    } else if (window.location.host == "localhost:5177") {
      debugUser = "user-c";
    }

    // TODO - load from storage, maybe
    this.initForUser(debugUser);

    // Note: the visibilitychange handler function cannot be async
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'hidden') {
        this.onEnterBackground();
      } else if (document.visibilityState == 'visible') {
        this.onEnterForeground();
      }
    });
    this.onEnterForeground();
  }

  onEnterForeground() {
    console.log("onEnterForeground")
    this.readStateFromStorage();
    this.autosaveTimer.onEnterForeground();
  }

  onEnterBackground() {
    console.log("onEnterBackground")
    this.saveAll();
    this.autosaveTimer.onEnterBackground();
  }

  readUserFromStorage(username) {
    // TODO - left off here
  }

  readStateFromStorage() {
  }

  old_readStateFromStorage() {
    let appState = localStorage.getItem(APP_STORAGE_KEY);
    if (!appState) {
      return;
    }
    console.log(`Loading app state`);
    try {
      ser.readFromJson(this, JSON.parse(appState))
    } catch (err) {
      console.error("Error loading config: " + err);
      /*
      this.toast({
        message: 'Failed to load app state! Please contact the developer. You can'
         + ' wait for a fix, import a backup, or reset the app from Settings. Error: ' + err,
        type: 'error',
        duration: 0
      });
      */
    }
  }

  saveAll() {
    try {
      console.log(`Saving app state.`);

      /*
      let stateData = ser.writeToJson(this);
      let jsonData = prettyJson(stateData);
      //console.log(jsonData);
      localStorage.setItem(APP_STORAGE_KEY, jsonData);
      */

      let userData = prettyJson(this.writeUserToJson());
      console.log("User data: ", userData);
      localStorage.setItem(this.username, userData)
    } catch (err) {
      console.error("Error on saveAll: " + err);
      /*
      this.toast({
        message: 'Failed to save app state! Please contact the developer. ' + err,
        type: 'error',
        duration: 0
      });
      */
    }
  }

  onAutosave() {
    // TODO
  }

  writeToStorage() {
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

