const { getClass } = require("../consts");
const {ipcRenderer } = require("electron");

function initExit() {
    getClass("headerBarRight", 0).innerHTML += `<div class="imageButton zenoExit" onmouseenter="playTick()"></div>`

    getClass("zenoExit", 0).addEventListener("click", () => ipcRenderer.send("close-client"));
}

exports.initExit = initExit;