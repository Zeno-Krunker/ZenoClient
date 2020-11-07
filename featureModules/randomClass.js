var { getID } = require("../consts");
const Store = require("electron-store");
const store = new Store();

module.exports = () => {
    if(store.get("RandomClass") !== true) return;
    getID("menuClassContainer").insertAdjacentHTML(
        "beforeend",
        '<div id="randomClass" class="button bigShadowT mycustomButton" onmouseenter="playTick()" onclick="window.randomClass()">Random Class</div>'
    );

    window.randomClass = () => {
        var rand = Math.floor(Math.random() * (13 - 0 + 1));
        selectClass(rand);
    };
}