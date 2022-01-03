import ConnectionService from './ConnectionService.js';

var connectionService;
var textarea;
var initialized = false;

export function init(options) {
    connectionService = new ConnectionService(options.onOpen, updateTextContent, {
        text: [],
    });

    textarea = options.textarea;
    textarea.oninput = update;
    initialized = true;
}

export function connect(peerId) {
    if (!initialized) throw new Error('Make sure to call init before.');
    if (textarea.value != '')
        throw new Error('Ensure that the textarea is empty before connecting');

    connectionService.connect(peerId);
}

function update(e) {
    //update document

    //TODO: What if the user has something selected when deleting or inserting
    connectionService.changeDoc('Update text', (doc) => {
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

                //TODO:
            case 'insertFromPaste':
                break;

            default:
                break;
        }
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

function updateTextContent(doc) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    textarea.value = '';
    doc.text.forEach((text) => {
        textarea.value += text;
    });
    textarea.selectionStart = start;
    textarea.selectionEnd = end;
}