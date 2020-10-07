var { getID } = require("../consts");

module.exports = () => {
    getID("menuClassContainer").insertAdjacentHTML(
        "beforeend",
        '<div id="randomClass" class="button bigShadowT mycustomButton" onmouseenter="playTick()" onclick="window.randomClass()">Random Class</div>'
    );

    window.randomClass = () => {
        var rand = Math.floor(Math.random() * (13 - 0 + 1));
        selectClass(rand);
    };
}