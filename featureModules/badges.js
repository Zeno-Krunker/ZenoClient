const { getClass } = require('../consts.js');
const { ZenoEmmiter } = require('../events');

let badgeUrls = new Map()
    .set("verified", "https://cdn.discordapp.com/attachments/756142725262213180/756190756984586381/Zeno_Verified.png")
    .set("content-creators", "https://cdn.discordapp.com/attachments/756142725262213180/756326228390182952/Zeno_CC.png")
    .set("dev", "https://cdn.discordapp.com/attachments/756142725262213180/756322128168747168/Zeno_Dev.png")
    .set("vip", "https://cdn.discordapp.com/attachments/756142725262213180/756343842764226670/Zeno_VIP.png")
    .set("gfx", "https://cdn.discordapp.com/attachments/756142725262213180/756193773515702312/Zeno_GFX.png")
    .set("booster", "https://cdn.discordapp.com/attachments/756142725262213180/756341309425451100/Zeno_Booster.png")
    .set("yendis-staff", "https://media.discordapp.net/attachments/756142725262213180/756335806901125130/Zeno_YS.png");

fetch("https://zenokrunkerapi.web.app/badgeData.json")
    .then((resp) => resp.json())
    .then((data) => { badgeObj = data; })
    .catch(error => console.error(error));


function initBadges() {
    ZenoEmmiter.on("LoadBadges", checkPlayer);
}

function checkPlayer() {
    for(let cur of badgeUrls.keys()) {
        if (badgeObj[cur].indexOf(window.getGameActivity().user) != -1) {
            getClass("menuClassPlayerName", 0).insertAdjacentHTML("beforebegin", `<img class="zenoBadge" src="${badgeUrls.get(cur)}">`);
        }
    };
}

exports.initBadges = initBadges;