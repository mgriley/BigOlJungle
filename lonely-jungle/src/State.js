import { reactive, ref } from 'vue'
import { prettyJson, valOr, } from './Utils.js'
import * as ser from 'Shared/SerUtil.js'
import { AutosaveTimer } from 'Shared/AutosaveTimer.js'
import { Peer } from 'peerjs'
import { ReqMap, makePromiseObj, } from './ReqMap.js'

export var gApp = null;
export var isDebugging = true;

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

export class ChatMessage {
  constructor() {
    this.isMe = false;
    this.body = "";
    this.date = new Date();

    this.serFields = [
      'isMe',
      'body',
      ser.dateField('date'),
    ]
  }
}

export class UserChat {
  constructor(username) {
    this.username = valOr(username, "");
    this.messages = []
    this.nextMessage = "";

    this.serFields = [
      'username',
      ser.arrayField('messages', () => { return new ChatMessage(); }),
      'nextMessage',
    ]
  }

  async sendMessage() {
    if (!this.nextMessage) {
      return;
    }
    try {
      await gApp.fetchFromPeer(this.username, {
        name: 'PostMsg',
        msg: this.nextMessage,
      })
      let msg = new ChatMessage();
      msg.isMe = true;
      msg.body = this.nextMessage;
      this.addMessage(msg);
      this.nextMessage = "";
    } catch (err) {
      // TODO - alert user?
      throw new Error("Failed to send msg");
    }
  }

  addMessage(msg) {
    // TODO - put in some rate limiting here
    // TODO - notify new message?
    console.log(`Adding message for chat ${this.username}: `, msg);
    this.messages.push(msg);
  }
}

export class Chat {
  constructor() {
    this.chats = [];
    this.selectedChat = null;

    this.serFields = [
      ser.arrayField('chats', () => { return new UserChat(); }),
    ]
  }

  getChatForUser(username) {
    // Find or create
    for (const chat of this.chats) {
      if (chat.username == username) {
        return chat;
      }
    }

    let newChat = new UserChat();
    newChat.username = username;
    this.chats.push(newChat)
    return newChat;
  }

  openChat(username) {
    this.selectedChat = this.getChatForUser(username);
  }
};

export class Friend {
  constructor(username) {
    this.username = username || "";

    // TODO
    /*
    this.lastSeenOnline = new Date();
    this.lastVisited = new Date();
    this.lastNewStatus = new Date();
    // TODO - may need lastMsgTime, per user
    this.isOnline = false;
    */

    this.serFields = [
      'username',
      // 'lastSeenOnline',
      // 'lastVisited',
      // 'lastNewStatus',
      // 'isOnline',
    ]
  }
}

export class FriendsList {
  constructor() {
    this.friends = [];

    this.serFields = [
      {
        name: 'friends',
        type: 'ObjArray', 
        elemCtor: () => { return new Friend(); },
      }
    ]
  }
};

export class UserData {
  constructor(username) {
    this.username = username;
    this.page = new Page(true);
    this.chat = new Chat();
    this.friendsList = new FriendsList();

    this.serFields = [
      'page',
      'chat',
      'friendsList',
    ]
  }

  setupDebugData() {
    // Debug data
    if (this.username == 'user-a') {
      this.friendsList.friends = [
        new Friend("user-b"),
        new Friend("user-c"),
      ]
    } else if (this.username == 'user-b') {
      this.friendsList.friends = [
        new Friend("user-a"),
        new Friend("user-c"),
      ]
    } else if (this.username == 'user-c') {
      this.friendsList.friends = [
        new Friend("user-a"),
        new Friend("user-c"),
      ]
    }
  }

  dumpState() {
    let json = ser.writeToJson(this);
    console.log("Data: ", prettyJson(json));
  }
};

export class App {
  constructor(toaster, router) {
    this.toaster = toaster;
    this.router = router;

    this.userData = ref(new UserData("NoName"));
    this.pagesCache = ref({})

    this.autosaveTimer = new AutosaveTimer(15, () => {
      this.onAutosave();
    })

    this.reqIdCtr = 1;
  }

  getUser() {
    return this.userData.value;
  }

  loadUser(username) {
    // TODO - prevent overwriting the user's data on a bad load, here.

    console.log(`Loading user: ${username}`)
    this.userData.value = new UserData(username);
    let storedData = localStorage.getItem(username);
    if (storedData) {
      try {
        ser.readFromJson(this.userData.value, JSON.parse(storedData));
        console.log(`Loaded data for user ${this.userData.value.username}`);
      } catch (err) {
        console.error(`Failed to parse userData for ${username}:\n${storedData}`);
      }
    } else {
      console.log(`No stored data found for ${username}`);
    }
    this.userData.value.setupDebugData();

    this.pagesCache.value = {};

    if (this.peer) {
      this.peer.destroy();
    }
    this.peer = new Peer(this.userData.value.username, {
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
      console.log("Attempting to reconnect");
      this.peer.reconnect();
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
      let conn = this.peer.connect(username, {
        reliable: true,
      });
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
    let username = conn.peer;
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
          let pageData = ser.writeToJson(this.userData.value.page);
          console.log("My page data: ", prettyJson(pageData));
          conn.send({
            name: data.name,
            reqId: data.reqId,
            isResponse: true,
            page: pageData,
          })
        } else if (data.name == "PostMsg") {
          // TODO - more validation
          if (!(typeof data.msg == 'string')) {
            throw new Error("Bad PostMsg: " + data);
          }
          let chatMsg = new ChatMessage();
          chatMsg.body = data.msg;
          let userChat = gApp.getUser().chat.getChatForUser(username);
          userChat.addMessage(chatMsg);

          // TODO - add to the chat
          conn.send({
            name: data.name,
            reqId: data.reqId,
            isResponse: true,
          })
        } else {
          console.log("Unknown request name: " + data.name);
        }
      }
    });

    return connInfo;
  }

  run() {
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

  readStateFromStorage() {
    // TODO - read curr username from storage
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

    this.loadUser(debugUser);
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
      let userData = prettyJson(ser.writeToJson(this.userData.value));
      let storageKey = this.userData.value.username;
      // console.log(`Saving user data to ${storageKey}: `, userData);
      console.log(`Saving user data for ${this.userData.value.username} to ${storageKey}.`);
      localStorage.setItem(storageKey, userData)
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
    this.saveAll();
  }

  changeUser(username) {
    console.log("Changing user: " + username);
    this.loadUser(username);
  }
}


export function initGlobalApp(toaster, router) {
  gApp = new App(toaster, router);
  gApp.run();
  return gApp;
}

