const { getID, getClass } = require("../consts");
const {ipcRenderer } = require("electron");

function initExit() {
    console.log(getClass("headerBarRight", 0))
    getClass("headerBarRight", 0).innerHTML += `<div class="imageButton zenoExit" onmouseenter="playTick()"></div>`
    console.log(getClass("headerBarRight", 0))

    getClass("zenoExit", 0).addEventListener("click", () => ipcRenderer.send("close-client"));
}

exports.initExit = initExit;