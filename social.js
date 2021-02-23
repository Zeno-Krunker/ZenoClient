/*
    Social.js Zeno Client 
    By : Zeno Client Team
*/

// *** Import Modules ***
const { ipcRenderer, remote } = require('electron');
const { getID, getResourceSwapper } = require("./consts");
const fs = require("fs");
const Store = require("electron-store");
const store = new Store();

window.home = () => window.location.href = 'https://krunker.io/social.html';

ipcRenderer.on('home', window.home);

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "F3": window.home(); break
        case "F4": window.location.reload(); break;
        case "F7": ipcRenderer.send("devtools"); break;
        default: break;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    let cssFile = (store.get("RS") && fs.existsSync(getResourceSwapper(remote) + "css/social_custom.css")) ? getResourceSwapper(remote) + "css/social_custom.css" : __dirname + "/css/social/social.css";
        fs.readFile(cssFile, "utf-8", (e, data) => {
            if (e) return console.log(e);
            document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='custom-css'></style>`);
            getID("custom-css").innerHTML = data;
    });

    window.document.body.insertAdjacentHTML("beforeend", `<div id="hrefprev" style="position:absolute;left:0;bottom:0;height:15px;background-color:#fff;z-index:9999;font-family:sans-serif;font-size: 12px;line-height:15px;padding-left:5px;padding-right:5px"></div>`)
    let hrefprev = getID("hrefprev");

    window.addEventListener("mousemove", e => { hrefprev.innerHTML = e.target?.href || "" });
    window.addEventListener("mousedown", e => {
        if(e.button == 2 && e.target.href && !e.target.disabled) {
            e.preventDefault();
            window.location.href = e.target.href;
        }
    });
});