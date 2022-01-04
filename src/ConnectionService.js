import * as Automerge from 'automerge';
import { Peer } from 'peerjs';

var debug = function() {
    if (window.debug === true) console.log(new Date().getTime(), ...arguments);
};

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
            debug('Received connection from', conn.peer);

            conn.on('data', (data) => {
                this.receiveHandler(conn, data); //arrow function to keep this reference
            });
            this.connections.set(conn, Automerge.initSyncState());
        });

        this.doc = Automerge.from(initialDocData);
    }

    changeDoc(msg, callback) {
        debug('Changing:', msg, this.doc.text);

        this.doc = Automerge.change(this.doc, msg, callback);
        debug('After changes:', this.doc.text);

        this.sync();
    }

    connect(peerId) {
        debug('Connecting to', peerId);

        let conn = this.peer.connect(peerId);

        conn.on('open', () => {
            this.connections.set(conn, Automerge.initSyncState());
            conn.send({ type: 'SyncRequest' });
        });

        conn.on('data', (data) => {
            this.receiveHandler(conn, data); //arrow function to keep this reference
        });
    }

    sync() {
        for (let [conn, state] of this.connections.entries()) {
            debug('Syncing with', conn.peer);

            let msg = null;
            [state, msg] = Automerge.generateSyncMessage(this.doc, state);
            this.connections.set(conn, state);
            if (msg) conn.send({ type: 'Changes', data: ToBase64(msg) });
            else debug('Sync not neccessary');
        }
    }

    receiveHandler(conn, data) {
        debug('Receiving information from', conn.peer);

        switch (data.type) {
            case 'Changes':
                debug('Applying changes to:', this.doc.text);

                data.data = new Uint8Array(FromBase64(data.data));
                let state = null;
                [this.doc, state] = Automerge.receiveSyncMessage(
                    this.doc,
                    this.connections.get(conn),
                    data.data
                );

                debug('After changes:', this.doc.text);

                this.connections.set(conn, state);
                this.sync();
                this.afterChangeCallback(this.doc);
                break;

            case 'SyncRequest':
                this.sync();

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