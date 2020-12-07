const { getID, getClass } = require("../consts");
const { initTwitch } = require("./twitch");
const fs = require("fs");
const { ipcRenderer } = require("electron");
const Store = require("electron-store");
const store = new Store();

//#region Settings Classes
class Header {
    constructor(label) {
        this.label = label.toString();
    }

    get html() {
        let HTMLString = `<div class="setHed"><span class="material-icons plusOrMinus">keyboard_arrow_down</span> ${this.label}</div>`;
        return HTMLString;
    }
}

class TextSetting {
    constructor({label, inputLabel, inputId, buttonLabel, buttonId}, onClick, requireRestart) {
        if(typeof onClick == "function"){
            this.onClick = onClick;
        } else {
            throw "onClick is not a valid function!";
        }
        this.label = label.toString();
        this.inputLabel = inputLabel.toString();
        this.inputId = inputId.toString();
        this.buttonLabel = buttonLabel.toString();
        this.buttonId = buttonId.toString();
        this.require = Boolean(requireRestart);
    }

    get html() {
        let HTMLString = `<div class="settName zenoSetting" id="importSettings_div" style="display:block"><span>${this.label}${this.requireRestart ? "*" : ""}</span><a class="+" id="${this.buttonId}">${this.buttonLabel}</a><input type="text" placeholder="${this.inputLabel}" name="url" class="inputGrey2" id="${this.inputId}"></div>`;
        return HTMLString;
    }

    get button() {
        return getID(this.buttonId);
    }

    registerFunction() {
        this.button.addEventListener("click", this.onClick);
    }
}

class ToggleSetting {
    constructor({label, buttonId, storeKey}, onToggle, requireRestart) {
        if(typeof onToggle == "function"){
            this.onToggle = onToggle;
        } else {
            throw "onToggle is not a valid function!";
        }
        this.label = label.toString();
        this.buttonId = buttonId.toString();
        this.storeKey = storeKey.toString();
        this.requireRestart = Boolean(requireRestart);
    }

    get html() {
        let HTMLString = `<div class="settName">${this.label}${this.requireRestart ? "*" : ""}<label class="switch" style="margin-left:10px"><input type="checkbox" id="${this.buttonId}" ${(store.get(this.storeKey) == true) ? "checked" : ""}><span class="slider"></span></label></div>`;
        return HTMLString;
    }

    get button() {
        return getID(this.buttonId);
    }

    registerFunction() {
        this.button.addEventListener("click", () => { this.onToggle(this.button.checked) });
    }
}

class ColorSetting extends ToggleSetting {
    constructor () {
        let ret = super(...arguments);
        return ret;
    }

    get html () {
        let HTMLString = `<div class="settName">${this.label}${this.requireRestart ? "*" : ""}<input type="color" name="color" id="${this.buttonId}" style="float:right" value="${store.get(this.storeKey)}"></div>`; // oninput="setTimeout(() => {store.set(${this.storeKey}, this.value)},0)"
        return HTMLString;
    }
}

class ButtonSetting {
    constructor({ label, buttonLabel, buttonId }, onClick, requireRestart) {
        if(typeof onClick == "function"){
            this.onClick = onClick;
        } else {
            throw "onClick is not a valid function!";
        }
        this.label = label;
        this.buttonLabel = buttonLabel;
        this.buttonId = buttonId;
        this.requireRestart = Boolean(requireRestart);
    }

    get html() {
        let HTMLString = `<div class="settName zenoSetting" id="importSettings_div" style="display:block"><span>${this.label}${this.requireRestart ? "*" : ""}</span><a class="+" id="${this.buttonId}">${this.buttonLabel}</a></div>`;
        return HTMLString;
    }

    get button() {
        return getID(this.buttonId);
    }

    registerFunction() {
        this.button.addEventListener("click", this.onClick);
    }
}
//#endregion

// Map for looping over all settings
let SettingsMap = new Map();

//#region ----GAMEPLAY----
SettingsMap.set("GameplayHeader", new Header("Gameplay"));

//#region Scout Mode Toggle
SettingsMap.set("ScoutModeToggle", new ToggleSetting({
    label: "Scout Mode",
    buttonId: "ScoutModeToggle_btn",
    storeKey: "ScoutMode",
}, (checked) => { 
    store.set("ScoutMode", checked);

    let instructions = getID("instructions");

    let specBtn = getClass("switchsml", 1).children[0];
    window.toggleSpect(checked);
    specBtn.checked = checked;
    instructions.innerHTML = checked ? "Click To Scout Lobby" : "Click To Play";

    new MutationObserver(() => {
        let instruction = store.get("ScoutMode") ? "Click To Scout Lobby" : "Click To Play";
        if(instructions.textContent.toLowerCase() == instruction.toLowerCase()) return;
        instructions.innerHTML = instruction;
    }).observe(instructions, { childList: true });

    return;
}));
//#endregion
//#endregion

//#region ----MISCELLANEOUS----
SettingsMap.set("MiscellaneousHeader", new Header("Miscellaneous"));

//#region Zeno CSS Toggle
SettingsMap.set("ZenoCSSToggle", new ToggleSetting({
    label: "Disable Zeno CSS",
    buttonId: "ZenoCSSToggle_btn",
    storeKey: "ZenoCSS",
}, (checked) => {
    store.set("ZenoCSS", checked);
    try {        
        if(checked) {
            getID("custom-css").innerHTML = "";
        } else {
            getID("custom-css").innerHTML = window.customCSS;
        }
    } catch (error) {console.log(error)}
}));

//#endregion

//#region Import CSS
SettingsMap.set("ImportCSS", new TextSetting({
    label: "Import CSS",
    inputLabel: "Paste your CSS here",
    inputId: "settingString",
    buttonLabel: "Import",
    buttonId: "ImportCSS_btn",
}, () => {
    var string = settingString.value;
    if (string) {
        var path = `${getResourceSwapper(remote)}css/`;
        fs.existsSync(path) ? console.log('Nothing') : fs.mkdirSync(path)
        fs.writeFileSync(path + 'main_custom.css', string.replace(/\s{2,10}/g, " ").trim());
        askRestart();
    }
}));
//#endregion

//#region Change Logo
SettingsMap.set("ChangeLogo", new TextSetting({
    label: "Custom Logo",
    inputLabel: "Logo URL",
    inputId: "logosp",
    buttonLabel: "Change",
    buttonId: "ChangeLogo_btn"
}, () => {
    if (!getID("logosp").value) {
        store.set("imgTag", "");
        getID("mainLogo").src = zenoIcon;
    } else {
        store.set("imgTag", getID("logosp").value);
        getID("mainLogo").src = getID("logosp").value;
    }
}));
//#endregion

//#region Link Twitch
SettingsMap.set("LinkTwitch", new TextSetting({
    label: "Link Twitch Chat",
    inputLabel: "Twitch Channel Name",
    inputId: "twitchChannelName",
    buttonLabel: "Link",
    buttonId: "LinkTwitch_btn"
}, () => {
    initTwitch(getID('twitchChannelName').value);
}));
//#endregion

//#region Float Button
SettingsMap.set("FloatButtonToggle", new ToggleSetting({
    label: "Show Float Button",
    buttonId: "FloatButtonToggle_btn",
    storeKey: "FloatButton"
}, (checked) => {
    if(!checked) {
        document.getElementById("float-button-disable").innerHTML = `#ot-sdk-btn-floating.ot-floating-button {display: none !important;}`;
    } else {
        document.getElementById("float-button-disable").innerHTML = "";
    }
}))
//#endregion

//#region Clear Cache 
SettingsMap.set("ClearCacheButton", new ButtonSetting({
    label: "Clear Cache",
    buttonLabel: "Clear",
    buttonId: "ClearCacheButton_btn"
}, () => {
    ipcRenderer.send("ClearCache");
}, true));
//#endregion
//#endregion

//#region ----PERFORMANCE----
SettingsMap.set("PerformanceHeader", new Header("Performance"));

//#region VSync Toggle
SettingsMap.set("VSyncToggle", new ToggleSetting({
    label: "Enable VSync",
    buttonId: "VSyncToggle_btn",
    storeKey: "VSync",
}, (checked) => {
    store.set("VSync", checked);
}, true));
//#endregion

//#region Stream Overlay Toggle
SettingsMap.set("StreamOverlayToggle", new ToggleSetting({
    label: "Disable Stream Overlay",
    buttonId: "StreamOverlayToggle_btn",
    storeKey: "StreamOverlay",
}, (checked) => {
    store.set("StreamOverlay", checked);
}));
//#endregion


//#endregion

//#region ----DISCORD PRESENCE----
SettingsMap.set("DiscordPresenceHeader", new Header("Discord Rich Presence"));

//#region Discord Presence Toggle
SettingsMap.set("DiscordPresenceToggle", new ToggleSetting({
    label: "Enable Discord Presence",
    buttonId: "DiscordPresenceToggle_btn",
    storeKey: "DiscordPresence",
}, (checked) => {
    store.set("DiscordPresence", checked);
    return;
}, true));
//#endregion

//#region Ask to Join Toggle
SettingsMap.set("AskToJoinToggle", new ToggleSetting({
    label: "Enable Ask to Join",
    buttonId: "AskToJoinToggle_btn",
    storeKey: "AskToJoin",
}, (checked) => {
    store.set("AskToJoin", checked);
}));
//#endregion
//#endregion

//#region ----TOGGLE CLIENT FEATURES----
SettingsMap.set("ToggleClientFeaturesHeader", new Header("Toggle Client Features"));

//#region Random Class Button
SettingsMap.set("RandomClassToggle", new ToggleSetting({
    label: "Random Class Button",
    buttonId: "RandomClassToggle_btn",
    storeKey: "RandomClass"
}, (checked) => {
    store.set("RandomClass", checked);
    return;
}, true));
//#endregion

//#region Bagdes Toggle
SettingsMap.set("BadgesToggle", new ToggleSetting({
    label: "Zeno Badges",
    buttonId: "BadgesToggle_btn",
    storeKey: "Badges"
}, (checked) => {
    store.set("Badges", checked);
    return;
}, true));
//#endregion

//#region Chat Mute 
SettingsMap.set("ChatMuteToggle", new ToggleSetting({
    label: "Chat Mute Feature",
    buttonId: "ChatMuteToggle_btn",
    storeKey: "ChatMute"
}, (checked) => {
    store.set("ChatMute", checked);
}, true))
//#endregion
//#endregion

SettingsMap.set("ExperimentalHeader", new Header("Experimental"));

// in game badges
SettingsMap.set("InGameBadges", new ToggleSetting({
    label: "In Game Badges",
    buttonId: "InGameBadges_btn",
    storeKey: "InGameBadges",
    requireRestart: false
}, (checked) => {
    store.set("InGameBadges", checked);
}, false))

// sky color
SettingsMap.set("SkyColor", new ColorSetting({
    label: "Sky Color",
    buttonId: "SkyColor_btn",
    storeKey: "SkyColor",
}, function () {
    setTimeout(() => {
        store.set("SkyColor", this.button.value);
    }, 0);
}, true))

// sky color toggle
SettingsMap.set("SkyColorToggle", new ToggleSetting({
    label: "Sky Color Toggle",
    buttonId: "SkyColorToggle_btn",
    storeKey: "SkyColorToggle",
}, (checked) => {
    store.set("SkyColorToggle", checked);
}, true))

//#region Inserting Settings in the actual page
let settingsHTML = "";

for(let setting of SettingsMap.values()) {
    settingsHTML += setting.html + "\n";
}

window.openZenoWindow = () => {
    openHostWindow();
    getID('menuWindow').innerHTML = settingsHTML;

    for (let setting of SettingsMap.values()){
        if(!(setting instanceof Header)){
            setting.registerFunction();
        }
    }
}
//#endregion
