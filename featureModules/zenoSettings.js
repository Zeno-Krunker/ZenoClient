const { getID } = require("../consts");
const { initTwitch } = require("./twitch");
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
        this.button.addEventListener("click", this.onToggle);
    }
}
//#endregion

// Map for looping over all settings
let SettingsMap = new Map();

//#region ----MISCELLANEOUS----
SettingsMap.set("MiscellaneousHeader", new Header("Miscellaneous"));

//#region Import CSS
// SettingsMap.set("ImportCSSHeader", new Header("Import CSS"));

SettingsMap.set("ImportCSS", new TextSetting({
    label: "Import CSS",
    inputLabel: "Paste your CSS here",
    inputId: "settingString",
    buttonLabel: "Import",
    buttonId: "ImportCSS_btn",
}, () => {
    console.log("pog works");
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
//SettingsMap.set("ChangeLogoHeader", new Header("Change Logo"));

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
//SettingsMap.set("LinkTwitchHeader", new Header("Link Twitch"));

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
}, () => {
    let vsync = getID("VSyncToggle_btn").checked;
    store.set("VSync", vsync);
    askRestart();
}, true));

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
