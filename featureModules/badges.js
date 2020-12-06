const { getClass, getID, badgeUrls } = require('../consts.js');
const { ZenoEmitter, ZenoEvents } = require('../events');

let badges, badgesHTML = "";
async function initBadges() {
    if(!window.zenoBadges) return;
    badges = window.zenoBadges;

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
    if(getID("menuClassNameTag", 0).innerHTML.includes(`<img class="zenoModelPreviewBadge"`)) return;
    getClass("menuClassPlayerName", 0).insertAdjacentHTML("beforebegin", badgesHTML);
}

function headerBar() {
    if(getID("menuUsernameContainer").innerHTML.includes(`class="zenoHeaderBadge"`)) return;
    getID("menuMiniProfilePic").insertAdjacentHTML("afterend", `<img src="${badgeUrls.get(badges[0])}" class="zenoHeaderBadge"/>`);
}

function endTable() {
    let players = getClass("endTableN");
    let i = 0;
    while(true){
        try {
            if(players[i].style.color == "rgb(255, 255, 255)"){
                players[i].insertAdjacentHTML("beforebegin", `<img src="${badgeUrls.get(badges[0])}" class="zenoEndLeaderboardBadge"/>`);
            }
            i++;
        } catch (err) { break; }
    }
}

exports.initBadges = initBadges;