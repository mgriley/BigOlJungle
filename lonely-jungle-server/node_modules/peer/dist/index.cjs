var $cl6Iw$express = require("express");
var $cl6Iw$nodehttp = require("node:http");
var $cl6Iw$nodehttps = require("node:https");
var $cl6Iw$nodepath = require("node:path");
var $cl6Iw$nodecrypto = require("node:crypto");
var $cl6Iw$nodeevents = require("node:events");
var $cl6Iw$ws = require("ws");
var $cl6Iw$cors = require("cors");

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "ExpressPeerServer", () => $123f4982a51872b4$export$8c57434a18c696c9);
$parcel$export(module.exports, "PeerServer", () => $123f4982a51872b4$export$f99d31af51f48b1e);



const $629a620fdd8149f9$var$defaultConfig = {
    host: "::",
    port: 9000,
    expire_timeout: 5000,
    alive_timeout: 90000,
    key: "peerjs",
    path: "/",
    concurrent_limit: 5000,
    allow_discovery: false,
    proxied: false,
    cleanup_out_msgs: 1000,
    corsOptions: {
        origin: true
    }
};
var $629a620fdd8149f9$export$2e2bcd8739ae039 = $629a620fdd8149f9$var$defaultConfig;



class $884a4c78775bc4af$export$eb4c623330d4cbcc {
    lastReadAt = new Date().getTime();
    messages = [];
    getLastReadAt() {
        return this.lastReadAt;
    }
    addMessage(message) {
        this.messages.push(message);
    }
    readMessage() {
        if (this.messages.length > 0) {
            this.lastReadAt = new Date().getTime();
            return this.messages.shift();
        }
        return undefined;
    }
    getMessages() {
        return this.messages;
    }
}



class $7a434f2b8c14dece$export$3ee29d34e33d9116 {
    clients = new Map();
    messageQueues = new Map();
    getClientsIds() {
        return [
            ...this.clients.keys()
        ];
    }
    getClientById(clientId) {
        return this.clients.get(clientId);
    }
    getClientsIdsWithQueue() {
        return [
            ...this.messageQueues.keys()
        ];
    }
    setClient(client, id) {
        this.clients.set(id, client);
    }
    removeClientById(id) {
        const client = this.getClientById(id);
        if (!client) return false;
        this.clients.delete(id);
        return true;
    }
    getMessageQueueById(id) {
        return this.messageQueues.get(id);
    }
    addMessageToQueue(id, message) {
        if (!this.getMessageQueueById(id)) this.messageQueues.set(id, new (0, $884a4c78775bc4af$export$eb4c623330d4cbcc)());
        this.getMessageQueueById(id)?.addMessage(message);
    }
    clearMessageQueue(id) {
        this.messageQueues.delete(id);
    }
    generateClientId(generateClientId) {
        const generateId = generateClientId ? generateClientId : (0, $cl6Iw$nodecrypto.randomUUID);
        let clientId = generateId();
        while(this.getClientById(clientId))clientId = generateId();
        return clientId;
    }
}


const $41c352e9bd485a56$var$DEFAULT_CHECK_INTERVAL = 300;
class $41c352e9bd485a56$export$6fa53df6b5b88df7 {
    timeoutId = null;
    constructor({ realm: realm , config: config , checkInterval: checkInterval = $41c352e9bd485a56$var$DEFAULT_CHECK_INTERVAL , onClose: onClose  }){
        this.realm = realm;
        this.config = config;
        this.onClose = onClose;
        this.checkInterval = checkInterval;
    }
    start() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(()=>{
            this.checkConnections();
            this.timeoutId = null;
            this.start();
        }, this.checkInterval);
    }
    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    checkConnections() {
        const clientsIds = this.realm.getClientsIds();
        const now = new Date().getTime();
        const { alive_timeout: aliveTimeout  } = this.config;
        for (const clientId of clientsIds){
            const client = this.realm.getClientById(clientId);
            if (!client) continue;
            const timeSinceLastPing = now - client.getLastPing();
            if (timeSinceLastPing < aliveTimeout) continue;
            try {
                client.getSocket()?.close();
            } finally{
                this.realm.clearMessageQueue(clientId);
                this.realm.removeClientById(clientId);
                client.setSocket(null);
                this.onClose?.(client);
            }
        }
    }
}


let $115ef0ff92fe1a17$export$b8e9cd941e8016ac;
(function(Errors) {
    Errors["INVALID_KEY"] = "Invalid key provided";
    Errors["INVALID_TOKEN"] = "Invalid token provided";
    Errors["INVALID_WS_PARAMETERS"] = "No id, token, or key supplied to websocket server";
    Errors["CONNECTION_LIMIT_EXCEED"] = "Server has reached its concurrent user limit";
})($115ef0ff92fe1a17$export$b8e9cd941e8016ac || ($115ef0ff92fe1a17$export$b8e9cd941e8016ac = {}));
let $115ef0ff92fe1a17$export$80edbf15fa61a4db;
(function(MessageType) {
    MessageType["OPEN"] = "OPEN";
    MessageType["LEAVE"] = "LEAVE";
    MessageType["CANDIDATE"] = "CANDIDATE";
    MessageType["OFFER"] = "OFFER";
    MessageType["ANSWER"] = "ANSWER";
    MessageType["EXPIRE"] = "EXPIRE";
    MessageType["HEARTBEAT"] = "HEARTBEAT";
    MessageType["ID_TAKEN"] = "ID-TAKEN";
    MessageType["ERROR"] = "ERROR";
})($115ef0ff92fe1a17$export$80edbf15fa61a4db || ($115ef0ff92fe1a17$export$80edbf15fa61a4db = {}));


class $0684e92015b7a087$export$a13b411d0e88b1af {
    timeoutId = null;
    constructor({ realm: realm , config: config , messageHandler: messageHandler  }){
        this.realm = realm;
        this.config = config;
        this.messageHandler = messageHandler;
    }
    startMessagesExpiration() {
        if (this.timeoutId) clearTimeout(this.timeoutId);
        // Clean up outstanding messages
        this.timeoutId = setTimeout(()=>{
            this.pruneOutstanding();
            this.timeoutId = null;
            this.startMessagesExpiration();
        }, this.config.cleanup_out_msgs);
    }
    stopMessagesExpiration() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
    pruneOutstanding() {
        const destinationClientsIds = this.realm.getClientsIdsWithQueue();
        const now = new Date().getTime();
        const maxDiff = this.config.expire_timeout;
        const seen = {};
        for (const destinationClientId of destinationClientsIds){
            const messageQueue = this.realm.getMessageQueueById(destinationClientId);
            if (!messageQueue) continue;
            const lastReadDiff = now - messageQueue.getLastReadAt();
            if (lastReadDiff < maxDiff) continue;
            const messages = messageQueue.getMessages();
            for (const message of messages){
                const seenKey = `${message.src}_${message.dst}`;
                if (!seen[seenKey]) {
                    this.messageHandler.handle(undefined, {
                        type: (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).EXPIRE,
                        src: message.dst,
                        dst: message.src
                    });
                    seen[seenKey] = true;
                }
            }
            this.realm.clearMessageQueue(destinationClientId);
        }
    }
}




class $af5fd0bf18c3ac6d$export$1f2bb630327ac4b6 {
    socket = null;
    lastPing = new Date().getTime();
    constructor({ id: id , token: token  }){
        this.id = id;
        this.token = token;
    }
    getId() {
        return this.id;
    }
    getToken() {
        return this.token;
    }
    getSocket() {
        return this.socket;
    }
    setSocket(socket) {
        this.socket = socket;
    }
    getLastPing() {
        return this.lastPing;
    }
    setLastPing(lastPing) {
        this.lastPing = lastPing;
    }
    send(data) {
        this.socket?.send(JSON.stringify(data));
    }
}



const $e9ffe6de55430dbc$var$WS_PATH = "peerjs";
class $e9ffe6de55430dbc$export$f47674b57e51ee3b extends (0, $cl6Iw$nodeevents.EventEmitter) {
    constructor({ server: server , realm: realm , config: config  }){
        super();
        this.setMaxListeners(0);
        this.realm = realm;
        this.config = config;
        const path = this.config.path;
        this.path = `${path}${path.endsWith("/") ? "" : "/"}${$e9ffe6de55430dbc$var$WS_PATH}`;
        const options = {
            path: this.path,
            server: server
        };
        this.socketServer = config.createWebSocketServer ? config.createWebSocketServer(options) : new (0, $cl6Iw$ws.WebSocketServer)(options);
        this.socketServer.on("connection", (socket, req)=>{
            this._onSocketConnection(socket, req);
        });
        this.socketServer.on("error", (error)=>{
            this._onSocketError(error);
        });
    }
    _onSocketConnection(socket, req) {
        // An unhandled socket error might crash the server. Handle it first.
        socket.on("error", (error)=>{
            this._onSocketError(error);
        });
        // We are only interested in the query, the base url is therefore not relevant
        const { searchParams: searchParams  } = new URL(req.url ?? "", "https://peerjs");
        const { id: id , token: token , key: key  } = Object.fromEntries(searchParams.entries());
        if (!id || !token || !key) {
            this._sendErrorAndClose(socket, (0, $115ef0ff92fe1a17$export$b8e9cd941e8016ac).INVALID_WS_PARAMETERS);
            return;
        }
        if (key !== this.config.key) {
            this._sendErrorAndClose(socket, (0, $115ef0ff92fe1a17$export$b8e9cd941e8016ac).INVALID_KEY);
            return;
        }
        const client = this.realm.getClientById(id);
        if (client) {
            if (token !== client.getToken()) {
                // ID-taken, invalid token
                socket.send(JSON.stringify({
                    type: (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).ID_TAKEN,
                    payload: {
                        msg: "ID is taken"
                    }
                }));
                socket.close();
                return;
            }
            this._configureWS(socket, client);
            return;
        }
        this._registerClient({
            socket: socket,
            id: id,
            token: token
        });
    }
    _onSocketError(error) {
        // handle error
        this.emit("error", error);
    }
    _registerClient({ socket: socket , id: id , token: token  }) {
        // Check concurrent limit
        const clientsCount = this.realm.getClientsIds().length;
        if (clientsCount >= this.config.concurrent_limit) {
            this._sendErrorAndClose(socket, (0, $115ef0ff92fe1a17$export$b8e9cd941e8016ac).CONNECTION_LIMIT_EXCEED);
            return;
        }
        const newClient = new (0, $af5fd0bf18c3ac6d$export$1f2bb630327ac4b6)({
            id: id,
            token: token
        });
        this.realm.setClient(newClient, id);
        socket.send(JSON.stringify({
            type: (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).OPEN
        }));
        this._configureWS(socket, newClient);
    }
    _configureWS(socket, client) {
        client.setSocket(socket);
        // Cleanup after a socket closes.
        socket.on("close", ()=>{
            if (client.getSocket() === socket) {
                this.realm.removeClientById(client.getId());
                this.emit("close", client);
            }
        });
        // Handle messages from peers.
        socket.on("message", (data)=>{
            try {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const message = JSON.parse(data.toString());
                message.src = client.getId();
                this.emit("message", client, message);
            } catch (e) {
                this.emit("error", e);
            }
        });
        this.emit("connection", client);
    }
    _sendErrorAndClose(socket, msg) {
        socket.send(JSON.stringify({
            type: (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).ERROR,
            payload: {
                msg: msg
            }
        }));
        socket.close();
    }
}



const $07b58d06a24ebcce$export$65302b915833a46d = (client)=>{
    if (client) {
        const nowTime = new Date().getTime();
        client.setLastPing(nowTime);
    }
    return true;
};



const $ceefb4d5c5574ccb$export$809c011ea942310 = ({ realm: realm  })=>{
    const handle = (client, message)=>{
        const type = message.type;
        const srcId = message.src;
        const dstId = message.dst;
        const destinationClient = realm.getClientById(dstId);
        // User is connected!
        if (destinationClient) {
            const socket = destinationClient.getSocket();
            try {
                if (socket) {
                    const data = JSON.stringify(message);
                    socket.send(data);
                } else // Neither socket no res available. Peer dead?
                throw new Error("Peer dead");
            } catch (e) {
                // This happens when a peer disconnects without closing connections and
                // the associated WebSocket has not closed.
                // Tell other side to stop trying.
                if (socket) socket.close();
                else realm.removeClientById(destinationClient.getId());
                handle(client, {
                    type: (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).LEAVE,
                    src: dstId,
                    dst: srcId
                });
            }
        } else {
            // Wait for this client to connect/reconnect (XHR) for important
            // messages.
            const ignoredTypes = [
                (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).LEAVE,
                (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).EXPIRE
            ];
            if (!ignoredTypes.includes(type) && dstId) realm.addMessageToQueue(dstId, message);
            else if (type === (0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).LEAVE && !dstId) realm.removeClientById(srcId);
        }
        return true;
    };
    return handle;
};




class $89578eeb272510da$export$cfe4a96645b0bbcf {
    handlers = new Map();
    registerHandler(messageType, handler) {
        if (this.handlers.has(messageType)) return;
        this.handlers.set(messageType, handler);
    }
    handle(client, message) {
        const { type: type  } = message;
        const handler = this.handlers.get(type);
        if (!handler) return false;
        return handler(client, message);
    }
}


class $379224fea64e1898$export$3deceafe0aaeaa95 {
    constructor(realm, handlersRegistry = new (0, $89578eeb272510da$export$cfe4a96645b0bbcf)()){
        this.handlersRegistry = handlersRegistry;
        const transmissionHandler = (0, $ceefb4d5c5574ccb$export$809c011ea942310)({
            realm: realm
        });
        const heartbeatHandler = (0, $07b58d06a24ebcce$export$65302b915833a46d);
        const handleTransmission = (client, { type: type , src: src , dst: dst , payload: payload  })=>{
            return transmissionHandler(client, {
                type: type,
                src: src,
                dst: dst,
                payload: payload
            });
        };
        const handleHeartbeat = (client, message)=>heartbeatHandler(client, message);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).HEARTBEAT, handleHeartbeat);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).OFFER, handleTransmission);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).ANSWER, handleTransmission);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).CANDIDATE, handleTransmission);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).LEAVE, handleTransmission);
        this.handlersRegistry.registerHandler((0, $115ef0ff92fe1a17$export$80edbf15fa61a4db).EXPIRE, handleTransmission);
    }
    handle(client, message) {
        return this.handlersRegistry.handle(client, message);
    }
}




var $9d461d6237a76c70$exports = {};
$9d461d6237a76c70$exports = JSON.parse('{"name":"PeerJS Server","description":"A server side element to broker connections between PeerJS clients.","website":"https://peerjs.com/"}');



var $20377580afc1f4e2$export$2e2bcd8739ae039 = ({ config: config , realm: realm  })=>{
    const app = (0, ($parcel$interopDefault($cl6Iw$express))).Router();
    // Retrieve guaranteed random ID.
    app.get("/id", (_, res)=>{
        res.contentType("html");
        res.send(realm.generateClientId(config.generateClientId));
    });
    // Get a list of all peers for a key, enabled by the `allowDiscovery` flag.
    app.get("/peers", (_, res)=>{
        if (config.allow_discovery) {
            const clientsIds = realm.getClientsIds();
            return res.send(clientsIds);
        }
        return res.sendStatus(401);
    });
    return app;
};


const $6519c7a56ba95525$export$bf71da7aebe9ddc1 = ({ config: config , realm: realm , corsOptions: corsOptions  })=>{
    const app = (0, ($parcel$interopDefault($cl6Iw$express))).Router();
    app.use((0, ($parcel$interopDefault($cl6Iw$cors)))(corsOptions));
    app.get("/", (_, res)=>{
        res.send((0, (/*@__PURE__*/$parcel$interopDefault($9d461d6237a76c70$exports))));
    });
    app.use("/:key", (0, $20377580afc1f4e2$export$2e2bcd8739ae039)({
        config: config,
        realm: realm
    }));
    return app;
};


const $516a786dc008ff17$export$99152e8d49ca4e7d = ({ app: app , server: server , options: options  })=>{
    const config = options;
    const realm = new (0, $7a434f2b8c14dece$export$3ee29d34e33d9116)();
    const messageHandler = new (0, $379224fea64e1898$export$3deceafe0aaeaa95)(realm);
    const api = (0, $6519c7a56ba95525$export$bf71da7aebe9ddc1)({
        config: config,
        realm: realm,
        corsOptions: options.corsOptions
    });
    const messagesExpire = new (0, $0684e92015b7a087$export$a13b411d0e88b1af)({
        realm: realm,
        config: config,
        messageHandler: messageHandler
    });
    const checkBrokenConnections = new (0, $41c352e9bd485a56$export$6fa53df6b5b88df7)({
        realm: realm,
        config: config,
        onClose: (client)=>{
            app.emit("disconnect", client);
        }
    });
    app.use(options.path, api);
    //use mountpath for WS server
    const customConfig = {
        ...config,
        path: (0, ($parcel$interopDefault($cl6Iw$nodepath))).posix.join(app.path(), options.path, "/")
    };
    const wss = new (0, $e9ffe6de55430dbc$export$f47674b57e51ee3b)({
        server: server,
        realm: realm,
        config: customConfig
    });
    wss.on("connection", (client)=>{
        const messageQueue = realm.getMessageQueueById(client.getId());
        if (messageQueue) {
            let message;
            while(message = messageQueue.readMessage())messageHandler.handle(client, message);
            realm.clearMessageQueue(client.getId());
        }
        app.emit("connection", client);
    });
    wss.on("message", (client, message)=>{
        app.emit("message", client, message);
        messageHandler.handle(client, message);
    });
    wss.on("close", (client)=>{
        app.emit("disconnect", client);
    });
    wss.on("error", (error)=>{
        app.emit("error", error);
    });
    messagesExpire.startMessagesExpiration();
    checkBrokenConnections.start();
};


function $123f4982a51872b4$export$8c57434a18c696c9(server, options) {
    const app = (0, ($parcel$interopDefault($cl6Iw$express)))();
    const newOptions = {
        ...(0, $629a620fdd8149f9$export$2e2bcd8739ae039),
        ...options
    };
    if (newOptions.proxied) app.set("trust proxy", newOptions.proxied === "false" ? false : !!newOptions.proxied);
    app.on("mount", ()=>{
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!server) throw new Error("Server is not passed to constructor - can't start PeerServer");
        (0, $516a786dc008ff17$export$99152e8d49ca4e7d)({
            app: app,
            server: server,
            options: newOptions
        });
    });
    return app;
}
function $123f4982a51872b4$export$f99d31af51f48b1e(options = {}, callback) {
    const app = (0, ($parcel$interopDefault($cl6Iw$express)))();
    let newOptions = {
        ...(0, $629a620fdd8149f9$export$2e2bcd8739ae039),
        ...options
    };
    const port = newOptions.port;
    const host = newOptions.host;
    let server;
    const { ssl: ssl , ...restOptions } = newOptions;
    if (ssl && Object.keys(ssl).length) {
        server = (0, ($parcel$interopDefault($cl6Iw$nodehttps))).createServer(ssl, app);
        newOptions = restOptions;
    } else server = (0, ($parcel$interopDefault($cl6Iw$nodehttp))).createServer(app);
    const peerjs = $123f4982a51872b4$export$8c57434a18c696c9(server, newOptions);
    app.use(peerjs);
    server.listen(port, host, ()=>callback?.(server));
    return peerjs;
}


//# sourceMappingURL=index.cjs.map
