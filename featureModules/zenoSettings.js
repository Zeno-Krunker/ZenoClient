const { getID } = require("../consts");

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
    constructor({label, inputLabel, inputId, buttonLabel, buttonId}, buttonClick) {
        if(typeof buttonClick == "function"){
            this.buttonClick = buttonClick;
        } else {
            throw "buttonClick is not a valid function!";
        }
        this.label = label.toString();
        this.inputLabel = inputLabel.toString();
        this.inputId = inputId.toString();
        this.buttonLabel = buttonLabel.toString();
        this.buttonId = buttonId.toString();
    }

    get html() {
        let HTMLString = `<div class="settName" id="importSettings_div" style="display:block">${this.label}<input type="text" placeholder="${this.inputLabel}" name="url" class="inputGrey2" id="${this.inputId}"></div>
        <a class="+" id="${this.buttonId}">${this.buttonLabel}</a>`;
        return HTMLString;
    }

    get button() {
        return getID(this.buttonId);
    }

    registerFunction() {
        console.log("Function called")
        this.button.addEventListener("click", this.buttonClick);
    }
}

let SettingsMap = new Map();

//#region Import CSS
SettingsMap.set("ImportCSSHeader", new Header("Import CSS"));

SettingsMap.set("ImportCSS", new TextSetting({
    label: "CSS Text",
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
SettingsMap.set("ChangeLogoHeader", new Header("Change Logo"));

SettingsMap.set("ChangeLogo", new TextSetting({
    label: "Logo URL",
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
SettingsMap.set("LinkTwitchHeader", new Header("Link Twitch"));

SettingsMap.set("LinkTwitch", new TextSetting({
    label: "Twitch Channel Name",
    inputLabel: "Twitch Name",
    inputId: "twitchChannelName",
    buttonLabel: "Link",
    buttonId: "LinkTwitch_btn"
}, () => {
    initTwitch(getID('twitchChannelName').value);
}));
//#endregion

let settingsHTML = "";

for(let setting of SettingsMap.values()) {
    settingsHTML += setting.html + "\n";
}

window.openZenoWindow = () => {
    openHostWindow();
    getID('menuWindow').innerHTML = settingsHTML;

    for(let setting of SettingsMap.values()){
        console.log("Loop Started");
        if(setting instanceof TextSetting){
            console.log("Looping over");
            setting.registerFunction();
        }
    }
}