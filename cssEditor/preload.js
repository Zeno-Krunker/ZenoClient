const { ipcRenderer } = require("electron");

ipcRenderer.on("cur-css", (e, css) => {
    window.editor.getDoc().setValue(css);
});

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "F4": window.location.reload(); break;
        case "F7": ipcRenderer.send("devtools"); break;
        default: break;
    }
});

window.updatePreview = css => ipcRenderer.sendTo(2, "css-change", css);