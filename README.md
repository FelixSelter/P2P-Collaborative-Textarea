# Collaborative-Textarea
Simply add the multi user p2p functionality to your textarea.
View the minimal demo here:
https://felixselter.github.io/Collaborative-Textarea/
# This is not a Beta. Its in development and important features are missing. Its not working !!!

If you want to use this you have to download the repository. Then install all dependencies with `npm install --also=dev`   
Generate the browser version using `npm run publish`  
You can find it in dist/CollaborativeTextarea.prod.js  
This runs using the latest version of automerge (They still have to fix their cdn) not like all the others. You can also implement it way easier.

You can find a full example in the demo folder.

Its as easy as calling:
```js
 collaborativeTextarea.init({
        textarea: document.getElementById('textarea'),
        });
```
When you call this it will create a peer object. You most likely want to show the id to the user so he can connect to other peers. therefore you can parse a onopen funtion

```js
 collaborativeTextarea.init({
        textarea: document.getElementById('textarea'),
        onOpen: function(id) {
            document.getElementById('id').textContent = id;
        }
        });     
```

When your user wants to connect to someone else simply call the connect function. Make sure that the textarea is empty.
```js
function connectButtonClick() {
    //ensure that the textarea is empty
    if (document.getElementById('textarea').value == "")
        collaborativeTextarea.connect(document.getElementById('host').value);
    else alert("Clear your editor before connecting")
}
```