// import * as Automerge from 'automerge';
// import { peerjs } from 'peerjs';
const Peer = peerjs.Peer;

export default class ConnectionService {
    peer;
    connections = [];
    doc;
    state;
    afterChangeCallback;

    constructor(onOpen, afterChangeCallback, initialDocData) {
        this.afterChangeCallback = afterChangeCallback;
        this.peer = new Peer();
        this.peer.on('open', onOpen);
        this.peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                this.receiveHandler(data); //arrow function to keep this reference
            });
            this.connections.push(conn);
        });

        this.doc = Automerge.from(initialDocData);
        this.state = Automerge.initSyncState();
    }

    changeDoc(callback) {
        this.doc = Automerge.change(this.doc, callback);
        this.sync();
    }

    broadcast(msg) {
        //send update via peerjs
        this.connections.forEach((conn) => {
            conn.send(msg);
        });
    }

    connect(peerId) {
        let conn = this.peer.connect(peerId);
        conn.on('data', (data) => {
            this.receiveHandler(data); //arrow function to keep this reference
        });
        this.connections.push(conn);
    }

    sync() {
        let msg = null;
        [this.state, msg] = Automerge.generateSyncMessage(this.doc, this.state);
        if (!msg) return;
        this.broadcast({ type: 'update', data: ToBase64(msg) });
    }

    receiveHandler(data) {
        switch (data.type) {
            case 'update':
                data.data = new Uint8Array(FromBase64(data.data));
                [this.doc, this.state] = Automerge.receiveSyncMessage(
                    this.doc,
                    this.state,
                    data.data
                );
                this.sync();
                this.afterChangeCallback(this.doc);
                break;

            default:
                break;
        }
    }
}

function ToBase64(u8) {
    return btoa(String.fromCharCode.apply(null, u8));
}

function FromBase64(str) {
    return atob(str)
        .split('')
        .map(function(c) {
            return c.charCodeAt(0);
        });
}