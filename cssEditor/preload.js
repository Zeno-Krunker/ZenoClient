const fs = require("fs");
const { ipcRenderer, remote } = require("electron");
const { getResourceSwapper } = require("../consts");
let parentId;

ipcRenderer.on("css", (e, css) => { window.editor.getDoc().setValue(css) });
ipcRenderer.on("init", (e, id) => {
    ipcRenderer.sendTo(id, "css");
    parentId = id;
});

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "F4": window.location.reload(); break;
        case "F7": ipcRenderer.send("devtools"); break;
        default: break;
    }
});

window.updatePreview = css => { if(parentId) ipcRenderer.sendTo(parentId, "css-change", css) };

ipcRenderer.on("save", () => {
    let css = window.editor.getValue().toString();
    let dir = getResourceSwapper(remote);

    if(!fs.existsSync(dir + "css")){
        fs.mkdirSync(dir + "css", {recursive: true});
    }

    fs.writeFile(dir + "css/main_custom.css", css, { encoding: "utf-8" }, (err) => {
        console.log(err);
        if(err) window.alert("Couldn't save the file! Check console for more info!");    
    });
});

ipcRenderer.on("save-as", (e, path) => {
    let css = window.editor.getValue();
    fs.writeFile(path, css, { encoding: "utf-8" }, () => {});
});