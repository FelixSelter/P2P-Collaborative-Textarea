import * as Automerge from 'automerge';
import { peerjs } from 'peerjs';
const Peer = peerjs.Peer;

export function update(e) {
    //update document
    textDoc = Automerge.change(textDoc, (doc) => {
        switch (e.inputType) {
            case 'insertText':
                insertAt(doc.text, e.data);
                break;

            case 'insertLineBreak':
                insertAt(doc.text, '\n');
                break;

            case 'deleteContentBackward': //Fall through
            case 'deleteContentForward':
                doc.text.splice(textarea.selectionStart, 1);
                break;

            default:
                break;
        }
    });
    sync();
}

export function connect(peerId) {
    if (!initialized) throw new Error('Make sure to call init before.');
    if (textarea.value != '')
        throw new Error('Ensure that the textarea is empty before connecting');

    let conn = peer.connect(peerId);
    conn.on('data', receiveHandler);
    connections.push(conn);
}

function sync() {
    let msg = null;
    [state, msg] = Automerge.generateSyncMessage(textDoc, state);
    if (!msg) return;
    broadcast({ type: 'update', data: ToBase64(msg) });
}

function receiveHandler(data) {
    switch (data.type) {
        case 'update':
            data.data = new Uint8Array(FromBase64(data.data));
            [textDoc, state] = Automerge.receiveSyncMessage(
                textDoc,
                state,
                data.data
            );
            sync();
            updateTextContent();
            break;

        default:
            break;
    }
}

var peer;
var connections = [];
var textarea;
var textDoc;
var initialized = false;
var state;

export function init(options) {
    peer = new Peer();
    peer.on('open', options.onOpen);
    peer.on('connection', (conn) => {
        conn.on('data', receiveHandler);
        connections.push(conn);
    });

    textDoc = Automerge.from({ text: [] });
    state = Automerge.initSyncState();

    textarea = options.textarea;
    textarea.oninput = update;
    initialized = true;
}

function broadcast(msg) {
    //send update via peerjs
    connections.forEach((conn) => {
        conn.send(msg);
    });
}

/**
 * Inserts a character at the position of the textarea cursor into the automerge document
 * @param {Array} remote The text array of the automerge document
 * @param {String} value The text you want to insert
 */
function insertAt(remote, value) {
    //the position where the text is inserted
    let index = textarea.selectionStart - 1;

    //insert at cursor
    if (index < remote.length) remote.insertAt(index, value);
    else remote.push(value);
}

function updateTextContent() {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    textarea.value = '';
    textDoc.text.forEach((text) => {
        textarea.value += text;
    });
    textarea.selectionStart = start;
    textarea.selectionEnd = end;
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