const { EventEmitter } = require("events");
const { getID } = require("./consts");
const Store = require("electron-store");
const store = new Store();

const ZenoEvents = {
    GAME_LOADED: "GameLoaded",
    GAME_ACTIVITY_LOADED: "GameActivityLoaded",
    USER_CHANGED: "UserChanged",
    CLASS_CHANGED: "ClassChanged"
}

const ZenoEmitter = new EventEmitter();

//#region Game Load Event
new MutationObserver((mutationRecords, observer) => {
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

let gameActivity = false;
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
    return;
}, 1000);

exports.ZenoEmitter = ZenoEmitter;
exports.ZenoEvents = ZenoEvents;