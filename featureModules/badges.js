const { getClass, getID } = require('../consts.js');
const { ZenoEmitter, ZenoEvents } = require('../events');
const { DiscordClient } = require('./discordRPC');

let badgeUrls = new Map()
    .set("verified", "https://cdn.discordapp.com/attachments/756142725262213180/756190756984586381/Zeno_Verified.png")
    .set("content-creators", "https://cdn.discordapp.com/attachments/756142725262213180/756326228390182952/Zeno_CC.png")
    .set("dev", "https://cdn.discordapp.com/attachments/756142725262213180/756322128168747168/Zeno_Dev.png")
    .set("vip", "https://cdn.discordapp.com/attachments/756142725262213180/756343842764226670/Zeno_VIP.png")
    .set("gfx", "https://cdn.discordapp.com/attachments/756142725262213180/756193773515702312/Zeno_GFX.png")
    .set("booster", "https://cdn.discordapp.com/attachments/756142725262213180/756341309425451100/Zeno_Booster.png")
    .set("yendis-staff", "https://media.discordapp.net/attachments/756142725262213180/756335806901125130/Zeno_YS.png");

let badges, badgesHTML = "", badgeHTML = "";
async function initBadges() {
    await fetch("https://zenokrunkerapi.web.app/discordBadgeData.json")
        .then((resp) => resp.json())
        .then((data) => { badges = data[DiscordClient.user.id].badges; })
        .catch(error => console.error(error));
    if(!badges) return;

    for(let badge of badges){
        badgesHTML += `<img class="zenoModelPreviewBadge" src="${badgeUrls.get(badge)}">`;
    }

    ZenoEmitter.on(ZenoEvents.USER_CHANGED, () => { 
        modelPreview();
        headerBar();
    });
    ZenoEmitter.on(ZenoEvents.CLASS_CHANGED, modelPreview);
    ZenoEmitter.on(ZenoEvents.MATCH_ENDED, endTable);
}

function modelPreview() {
    if(getID("menuClassNameTag", 0).innerHTML.includes(`<img class="zenoModelPreviewBadge"`)) { return; }
    getClass("menuClassPlayerName", 0).insertAdjacentHTML("beforebegin", badgesHTML);
}

function headerBar() {
    getID("menuMiniProfilePic").insertAdjacentHTML("afterend", `<img src="${badgeUrls.get(badges[0])}" class="zenoHeaderBadge"/>`);
}

function endTable() {
    let displayName = getClass("menuClassPlayerName", 0).textContent;
    console.log(displayName);
    let players = getClass("endTableN");
    let i = 0;
    while(true){
        try {
            console.log(players[i].textContent)
            if(players[i].textContent.startsWith(displayName)){
                players[i].insertAdjacentHTML("beforebegin", `<img src="${badgeUrls.get(badges[0])}" class="zenoEndLeaderboardBadge"/>`);
            }
            i++;
        } catch (err) { break; }
    }
}

exports.initBadges = initBadges;