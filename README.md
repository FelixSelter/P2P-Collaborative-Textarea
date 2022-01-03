# Collaborative-Textarea
Simply add the multi user p2p functionality to your textarea.  

# This is not a Beta. Its in development and important features are missing. Its not working !!!

## Demo
https://felixselter.github.io/Collaborative-Textarea/  
This is using the index.html in this repo

## Using this
Its as easy as calling:
```js
collaborativeTextarea.init({
    textarea: document.getElementById('textarea'),
});
```
When you call this it will create a peer object. You most likely want to show the id to the user so he can connect to other peers. therefore you can specify an onopen callback

```js
collaborativeTextarea.init({
    textarea: document.getElementById('textarea'),
    onOpen: function(id) {
        document.getElementById('id').textContent = id;
    }
});     
```

When your user wants to connect to someone, simply call the connect function. Make sure that the textarea is empty.
```js
function onConnectButtonClick() {
    //ensure that the textarea is empty
    if (document.getElementById('textarea').value == "")
        collaborativeTextarea.connect(document.getElementById('host').value);
    else alert("Clear your editor before connecting"):
}
```

## Installation

To include this library use:  
`https://cdn.jsdelivr.net/gh/FelixSelter/P2P-Collaborative-Textarea/dist/CollaborativeTextarea.js`

You can also use npm:  
`npm install p2p-collaborative-textarea`  
And use like this:  
`import {init, connect} from "p2p-collaborative-textarea"`  
To get this on your webpage use webpack or whatever you prefer


## Building it yourself
1. Download the repository
2. Install dependencies with `npm install --also=dev`   
3. Generate the browser version using `npm run build:prod`  
4. Theres also `npm run build:dev` for debugging
5. Use `npm run autobuild` to create a dev build whenever you change code
6. `npm run test` is hopefully coming soon.
