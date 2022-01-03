!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.collaborativeTextarea=t():e.collaborativeTextarea=t()}(self,(function(){return(()=>{"use strict";var e={d:(t,n)=>{for(var o in n)e.o(n,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:n[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t),r:e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}},t={};e.r(t),e.d(t,{connect:()=>s,init:()=>i});const n=peerjs.Peer;class o{peer;connections=[];doc;state;afterChangeCallback;constructor(e,t,o){this.afterChangeCallback=t,this.peer=new n,this.peer.on("open",e),this.peer.on("connection",(e=>{e.on("data",(e=>{this.receiveHandler(e)})),this.connections.push(e)})),this.doc=Automerge.from(o),this.state=Automerge.initSyncState()}changeDoc(e){this.doc=Automerge.change(this.doc,e),this.sync()}broadcast(e){this.connections.forEach((t=>{t.send(e)}))}connect(e){let t=this.peer.connect(e);t.on("data",(e=>{this.receiveHandler(e)})),this.connections.push(t)}sync(){let e=null;var t;[this.state,e]=Automerge.generateSyncMessage(this.doc,this.state),e&&this.broadcast({type:"update",data:(t=e,btoa(String.fromCharCode.apply(null,t)))})}receiveHandler(e){var t;"update"===e.type&&(e.data=new Uint8Array((t=e.data,atob(t).split("").map((function(e){return e.charCodeAt(0)})))),[this.doc,this.state]=Automerge.receiveSyncMessage(this.doc,this.state,e.data),this.sync(),this.afterChangeCallback(this.doc))}}var a,r,c=!1;function i(e){a=new o(e.onOpen,h,{text:[]}),(r=e.textarea).oninput=l,c=!0}function s(e){if(!c)throw new Error("Make sure to call init before.");if(""!=r.value)throw new Error("Ensure that the textarea is empty before connecting");a.connect(e)}function l(e){a.changeDoc((t=>{switch(e.inputType){case"insertText":d(t.text,e.data);break;case"insertLineBreak":d(t.text,"\n");break;case"deleteContentBackward":case"deleteContentForward":t.text.splice(r.selectionStart,1)}}))}function d(e,t){let n=r.selectionStart-1;n<e.length?e.insertAt(n,t):e.push(t)}function h(e){let t=r.selectionStart,n=r.selectionEnd;r.value="",e.text.forEach((e=>{r.value+=e})),r.selectionStart=t,r.selectionEnd=n}return t})()}));