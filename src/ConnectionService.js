// import * as Automerge from 'automerge';
// import { peerjs } from 'peerjs';
const Peer = peerjs.Peer;

export default class ConnectionService {
    peer;
    connections = new Map();
    doc;
    afterChangeCallback;

    constructor(onOpen, afterChangeCallback, initialDocData) {
        this.afterChangeCallback = afterChangeCallback;
        this.peer = new Peer();
        this.peer.on('open', onOpen);
        this.peer.on('connection', (conn) => {
            conn.on('data', (data) => {
                this.receiveHandler(conn, data); //arrow function to keep this reference
            });
            this.connections.set(conn, Automerge.initSyncState());
        });

        this.doc = Automerge.from(initialDocData);
    }

    changeDoc(msg, callback) {
        this.doc = Automerge.change(this.doc, msg, callback);
        this.sync();
    }

    connect(peerId) {
        let conn = this.peer.connect(peerId);
        conn.on('data', (data) => {
            this.receiveHandler(conn, data); //arrow function to keep this reference
        });
        this.connections.set(conn, Automerge.initSyncState());
    }

    sync() {
        for (let [peer, state] of this.connections.entries()) {
            let msg = null;
            [state, msg] = Automerge.generateSyncMessage(this.doc, state);
            this.connections.set(peer, state);
            if (msg) peer.send({ type: 'changes', data: ToBase64(msg) });
        }
    }

    receiveHandler(peer, data) {
        switch (data.type) {
            case 'changes':
                data.data = new Uint8Array(FromBase64(data.data));
                let state = null;
                [this.doc, state] = Automerge.receiveSyncMessage(
                    this.doc,
                    this.connections.get(peer),
                    data.data
                );
                this.connections.set(peer, state);
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