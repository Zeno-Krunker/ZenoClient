const consts = require('../consts.js');

var badgeObj;

fetch(consts.badgeData)
    .then((resp) => resp.json())
    .then((data) => { badgeObj = data; })
    .catch(error => console.error(error));

var badges = consts.badges;

var badgeUrls = consts.badgeUrls;

var badgeImplemented = {
    verified: false,
    "content-creators": false,
    dev: false,
    vip: false,
    gfx: false,
};

function checkPlayer() {
    var checkDat = undefined
    try {
        checkDat = window.getGameActivity()
    } catch {}
    if (checkDat !== undefined)
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