const { EventEmitter } = require("events");
const { getID } = require("./consts");
const Store = require("electron-store");
const store = new Store();

const ZenoEmitter = new EventEmitter();

//#region Game Load Event
new MutationObserver((mutationRecords, observer) => {
    if (getID("customizeButton")) {
        ZenoEmitter.emit("GameLoaded");
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
        ZenoEmitter.emit("GameActivityLoaded");
    }

    if(prev.user != gameData.user){
        prev.user = gameData.user;
        ZenoEmitter.emit("UserChanged");
    }

    if(prev.class.name != gameData.class.name){
        prev.class.name = gameData.class.name;
        ZenoEmitter.emit("ClassChanged");
    }

    // if(user != gameData.user || classname != gameData.class.name){            
    //     user = gameData.user;
    //     classname = gameData.class.name;
    //     ZenoEmitter.emit("LoadBadges");
    // };
    return;
}, 1000);

// badgeEvent();

// function badgeEvent() {
//     if(!store.get("Badges")) return;
//     var user, classname;
//     setInterval(() => {
//         let gameData = window.getGameActivity();
//         if(user != gameData.user || classname != gameData.class.name){            
//             user = gameData.user;
//             classname = gameData.class.name;
//             ZenoEmitter.emit("LoadBadges");
//         };
//         return;
//     }, 1000);
// }

exports.ZenoEmitter = ZenoEmitter;