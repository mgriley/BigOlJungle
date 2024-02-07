import WebSocket, { WebSocketServer, ServerOptions } from "ws";
import { CorsOptions } from "cors";
import express from "express";
import http from "node:http";
import https from "node:https";
export interface IConfig {
    readonly host: string;
    readonly port: number;
    readonly expire_timeout: number;
    readonly alive_timeout: number;
    readonly key: string;
    readonly path: string;
    readonly concurrent_limit: number;
    readonly allow_discovery: boolean;
    readonly proxied: boolean | string;
    readonly cleanup_out_msgs: number;
    readonly ssl?: {
        key: string;
        cert: string;
    };
    readonly generateClientId?: () => string;
    readonly createWebSocketServer?: (options: ServerOptions) => WebSocketServer;
    readonly corsOptions: CorsOptions;
}
export enum MessageType {
    OPEN = "OPEN",
    LEAVE = "LEAVE",
    CANDIDATE = "CANDIDATE",
    OFFER = "OFFER",
    ANSWER = "ANSWER",
    EXPIRE = "EXPIRE",
    HEARTBEAT = "HEARTBEAT",
    ID_TAKEN = "ID-TAKEN",
    ERROR = "ERROR"
}
export interface IMessage {
    readonly type: MessageType;
    readonly src: string;
    readonly dst: string;
    readonly payload?: string | undefined;
}
export interface IClient {
    getId(): string;
    getToken(): string;
    getSocket(): WebSocket | null;
    setSocket(socket: WebSocket | null): void;
    getLastPing(): number;
    setLastPing(lastPing: number): void;
    send<T>(data: T): void;
}
export interface PeerServerEvents {
    on(event: "connection", listener: (client: IClient) => void): this;
    on(event: "message", listener: (client: IClient, message: IMessage) => void): this;
    on(event: "disconnect", listener: (client: IClient) => void): this;
    on(event: "error", listener: (client: Error) => void): this;
}
export function ExpressPeerServer(server: https.Server | http.Server, options?: Partial<IConfig>): express.Express & PeerServerEvents;
export function PeerServer(options?: Partial<IConfig>, callback?: (server: https.Server | http.Server) => void): express.Express & PeerServerEvents;

//# sourceMappingURL=peer.d.ts.map
