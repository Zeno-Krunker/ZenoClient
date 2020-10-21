const {badgeData, gameLoaded, badges, badgeUrls, getClass} = require('../consts.js');

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
    booster: false,
    "yendis-staff": false,
};


function initBadges() {
    var username = "";
    var temp = "";

    new MutationObserver(() => {
        if(getClass("menuClassPlayerName", 0)){
            temp = getClass("menuClassPlayerName", 0).innerHTML;
            if(username == temp) return;            
            username = temp;
            checkPlayer();
        }
    }).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
    });
}

function checkPlayer() {
    console.log("checkPlayer called");
    if (gameLoaded()){
        console.log("gameloaded");
        resetBadges();
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

}

function resetBadges(){
    console.log("badges reset")
    badgeImplemented = {
        verified: false,
        "content-creators": false,
        dev: false,
        vip: false,
        gfx: false,
    };
}

exports.initBadges = initBadges;