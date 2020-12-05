const { ZenoEmitter, ZenoEvents } = require("../events");
const Store = require("electron-store");
const { getClass, getID } = require("../consts");
const store = new Store();

ZenoEmitter.on(ZenoEvents.GAME_ACTIVITY_LOADED, () => {
    if(!store.get("ScoutMode", false)) return;
    let specBtn = getClass("switchsml", 1).children[0];
    window.toggleSpect(true);
    specBtn.checked = true;
    getID("instructions").innerHTML = "Click To Scout Lobby";
    return;
});