const { EventEmitter } = require("events");

const ZenoEmmiter = new EventEmitter();
exports.ZenoEmmiter = ZenoEmmiter;

exports.initEmitter = () => {
    badgeEvent();
}

function badgeEvent() {    
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