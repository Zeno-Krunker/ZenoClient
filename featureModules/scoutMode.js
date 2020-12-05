const { ZenoEmitter, ZenoEvents } = require("../events");
const Store = require("electron-store");
const { getClass, getID } = require("../consts");
const store = new Store();

let instructions;

ZenoEmitter.on(ZenoEvents.GAME_ACTIVITY_LOADED, () => {
    instructions = getID("instructions");
    if(!store.get("ScoutMode", false)) return;

    let specBtn = getClass("switchsml", 1).children[0];
    window.toggleSpect(true);
    specBtn.checked = true;
    instructions.innerHTML = "Click To Scout Lobby";

    new MutationObserver(() => {
        let instruction = store.get("ScoutMode") ? "Click To Scout Lobby" : "Click To Play";
        if(instructions.textContent.toLowerCase() == instruction.toLowerCase()) return;
        instructions.innerHTML = instruction;
    }).observe(instructions, { childList: true });

    return;
});