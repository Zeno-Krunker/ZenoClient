var { buttons, getID } = require("../consts");

function addRandomClassButton() {
    getID("menuClassContainer").insertAdjacentHTML(
        "beforeend",
        '<div id="randomClass customizeButton" class="button bigShadowT mycustomButton" onmouseenter="playTick()" onclick="window.randomClass()">Random Class</div>'
    );
}

module.exports = addRandomClassButton;