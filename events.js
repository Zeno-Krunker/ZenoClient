const { EventEmitter } = require("events");
const { getID } = require("./consts");

const ZenoEvents = {
    GAME_LOADED: "GameLoaded",
    GAME_ACTIVITY_LOADED: "GameActivityLoaded",
    USER_CHANGED: "UserChanged",
    CLASS_CHANGED: "ClassChanged",
    MATCH_ENDED: "MatchEnded"
}

const ZenoEmitter = new EventEmitter();

//#region Game Load Event
new MutationObserver(async (mutationRecords, observer) => {
    if (getID("customizeButton")) {
        ZenoEmitter.emit(ZenoEvents.GAME_LOADED);
        observer.disconnect();
    }
}).observe(document, {
    childList: true,
    subtree: true,
    characterDataOldValue: true,
});
//#endregion

//#region Events based on Game Activity
let gameActivity = false;
let gameEnded;
let prev = { user: "", class: { name: "" }};
setInterval(() => {
    let gameData;
    try{ gameData = window.getGameActivity() } catch (err) {return}

    if(!gameActivity) {
        gameActivity = true;
        ZenoEmitter.emit(ZenoEvents.GAME_ACTIVITY_LOADED);
    }

    if(prev.user != gameData.user){
        prev.user = gameData.user;
        ZenoEmitter.emit(ZenoEvents.USER_CHANGED);
    }

    if(prev.class.name != gameData.class.name){
        prev.class.name = gameData.class.name;
        ZenoEmitter.emit(ZenoEvents.CLASS_CHANGED);
    }

    if(gameData.time <= 0 && !gameEnded && gameActivity){
        gameEnded = true;
        setTimeout(() => { ZenoEmitter.emit(ZenoEvents.MATCH_ENDED); }, 9000);
    } else if(gameData.time > 0 && gameEnded) {
        gameEnded = false;
    }

    return;
}, 1000);
//#endregion

exports.ZenoEmitter = ZenoEmitter;
exports.ZenoEvents = ZenoEvents;