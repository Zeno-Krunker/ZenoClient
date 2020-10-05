const {badgeData, gameLoaded, badges, badgeUrls} = require('../consts.js');

var badgeObj;

fetch(badgeData)
    .then((resp) => resp.json())
    .then((data) => { badgeObj = data; })
    .catch(error => console.error(error));

var badgeImplemented = {
    verified: false,
    "content-creators": false,
    dev: false,
    vip: false,
    gfx: false,
};

function checkPlayer() {
    if (gameLoaded())
        badges.forEach((cur) => {
            if (badgeObj[cur].indexOf(window.getGameActivity().user) != -1) {
                if (!badgeImplemented[cur]) {
                    document
                        .getElementsByClassName("menuClassPlayerName")[0]
                        .insertAdjacentHTML(
                            "beforebegin",
                            `<img class="zenoBadge" src="` + badgeUrls[cur]["url"] + `">`
                        );
                    badgeImplemented[cur] = true;
                }
            }
        });

}

exports.checkPlayer = checkPlayer;