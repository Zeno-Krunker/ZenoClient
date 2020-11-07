const { getID } = require("../consts");
const { initTwitch } = require("./twitch");
const fs = require("fs");
const Store = require("electron-store");
const store = new Store();

//#region Settings Classes
class Header {
    constructor(label) {
        this.label = label.toString();
    }

    get html() {
        let HTMLString = `<div class="setHed">• ${this.label}</div>`;
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
        let HTMLString = `<div class="settName" id="importSettings_div" style="display:block">${this.label}${this.requireRestart ? "*" : ""}<input type="text" placeholder="${this.inputLabel}" name="url" class="inputGrey2" id="${this.inputId}"></div>
        <a class="+" id="${this.buttonId}">${this.buttonLabel}</a>`;
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
        let HTMLString = `<div class="settName">${this.label}${this.requireRestart ? "*" : ""}<label class="switch" style="margin-left:10px"><input type="checkbox" id="${this.buttonId}" ${(store.get(this.storeKey) === true) ? "checked" : ""}><span class="slider"></span></label></div>`;
        return HTMLString;
    }

    get button() {
        return getID(this.buttonId);
    }

    registerFunction() {
        this.button.addEventListener("click", () => { this.onToggle(this.button.checked) });
    }
}
//#endregion

// Map for looping over all settings
let SettingsMap = new Map();

//#region ----MISCELLANEOUS----
SettingsMap.set("MiscellaneousHeader", new Header("Miscellaneous"));

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
//#endregion

//#region ----DISCORD PRESENCE----
SettingsMap.set("DiscordPresenceHeader", new Header("Discord Rich Presence"));

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

//#region Inserting Settings in the actual page
let settingsHTML = "";

for(let setting of SettingsMap.values()) {
    settingsHTML += setting.html + "\n";
}

window.openZenoWindow = () => {
    openHostWindow();
    getID('menuWindow').innerHTML = settingsHTML;

    for(let setting of SettingsMap.values()){
        if(!(setting instanceof Header)){
            setting.registerFunction();
        }
    }
}
//#endregion
