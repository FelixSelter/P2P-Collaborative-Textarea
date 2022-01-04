import ConnectionService from './ConnectionService.js';

var connectionService;
var textarea;
var updateCallback;
var initialized = false;

export function init(options) {
    connectionService = new ConnectionService(options.onOpen, updateTextContent, {
        text: [],
    });

    textarea = options.textarea;
    updateCallback = options.onUpdate || function() {};

    if (textarea.value != '') {
        connectionService.changeDoc('Set initial state', (doc) => {
            doc.text = textarea.value.split('');
        });
    }

    textarea.addEventListener('beforeinput', update);
    initialized = true;
}

export function connect(peerId) {
    if (!initialized) throw new Error('Make sure to call init before.');
    if (textarea.value != '')
        throw new Error('Ensure that the textarea is empty before connecting');

    connectionService.connect(peerId);
}

function update(e) {
    connectionService.changeDoc('Update text', (doc) => {
        switch (e.inputType) {
            case 'insertText':
                {
                    deleteSelection(doc.text);
                    insertAt(doc.text, e.data);
                    break;
                }

            case 'insertLineBreak':
                {
                    deleteSelection(doc.text);
                    insertAt(doc.text, '\n');
                    break;
                }
            case 'deleteContentBackward':
                {
                    if (!deleteSelection(doc.text))
                        doc.text.splice(textarea.selectionStart - 1, 1);
                    break;
                }

            case 'deleteContentForward':
                {
                    if (!deleteSelection(doc.text))
                        doc.text.splice(textarea.selectionStart, 1);
                    break;
                }
            case 'insertFromPaste':
                {
                    deleteSelection(doc.text);
                    e.data
                    .split('')
                    .reverse()
                    .forEach((char) => insertAt(doc.text, char));
                    break;
                }

            default:
                break;
        }
    });
}

/**
 * Inserts a character at the position of the textarea cursor into the automerge document
 * @param {Array} text The text array of the automerge document
 * @param {String} value The text you want to insert
 */
function insertAt(text, value) {
    //the position where the text is inserted
    let index = textarea.selectionStart;

    //insert at cursor
    if (index < text.length) text.insertAt(index, value);
    else text.push(value);
}

function deleteSelection(text) {
    //if something is selected
    if (textarea.selectionEnd - textarea.selectionStart != 0) {
        //delete operation
        text.splice(
            textarea.selectionStart,
            textarea.selectionEnd - textarea.selectionStart
        );
        return true;
    }
    return false;
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
    updateCallback();
}