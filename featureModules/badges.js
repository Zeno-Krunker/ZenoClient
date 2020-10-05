var badgeObj;

fetch("https://zenoupdateapi.web.app/badgeData.json")
    .then((resp) => resp.json())
    .then((data) => { badgeObj = data; })
    .catch(error => console.error(error));

var badges = ["verified", "content-creators", "dev", "vip", "gfx"];

var badgeUrls = {
    verified: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756190756984586381/Zeno_Verified.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748572694705864896/badge-verified.png",
    },
    "content-creators": {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756326228390182952/Zeno_CC.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748574740830093473/badge-cc.png",
    },
    dev: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756322128168747168/Zeno_Dev.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748573364968226887/badge-dev.png",
    },
    vip: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756343842764226670/Zeno_VIP.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748572846845984868/badge-crown.png",
    },
    gfx: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756193773515702312/Zeno_GFX.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748576637225795614/badge-gfx.png",
    },
};

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