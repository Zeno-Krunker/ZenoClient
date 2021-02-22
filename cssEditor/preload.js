const fs = require("fs");
const { ipcRenderer, remote } = require("electron");
const { getResourceSwapper, getID } = require("../consts");
let parentId, cssDir = getResourceSwapper(remote) + "css/";

// On recieving the loaded CSS from parent window
ipcRenderer.on("css", (e, css) => {
    fs.readFile(cssDir + "main_custom.css", { encoding: "utf-8" }, (e, d) => {
        if(e) window.savedCSS = "";
        else window.savedCSS = d;
        window.editor.getDoc().setValue(css);
    });
});

// Requesting CSS from parent window
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

    if(!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, {recursive: true});

    fs.writeFile(cssDir + "main_custom.css", css, { encoding: "utf-8" }, (err) => {
        console.log(err);
        if(err) window.alert("Couldn't save the file! Check console for more info!");
        else {
            window.savedCSS = css;
            getID("status-save").style.opacity = 0;
        }
    });
});

ipcRenderer.on("save-as", (e, path) => {
    let css = window.editor.getValue();
    fs.writeFile(path, css, { encoding: "utf-8" }, () => {});
});