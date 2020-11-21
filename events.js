const { EventEmitter } = require("events");
const Store = require("electron-store");
const store = new Store();

const ZenoEmmiter = new EventEmitter();
exports.ZenoEmmiter = ZenoEmmiter;

exports.initEmitter = () => {
    badgeEvent();
}

function badgeEvent() {
    if(!store.get("Badges")) return;
    var user, classname;
    setInterval(() => {
        let gameData = window.getGameActivity();
        if(user != gameData.user || classname != gameData.class.name){            
            user = gameData.user;
            classname = gameData.class.name;
            ZenoEmmiter.emit("LoadBadges");
        };
        return;
    }, 1000);
}