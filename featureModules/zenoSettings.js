const { getID, getClass } = require("../consts");
const { initTwitch } = require("./twitch");
const { ipcRenderer } = require("electron");
const Store = require("electron-store");
const store = new Store();

require("./plugins/browser");

const Types = {
    HEADER: "HEADER",
    BUTTON: "BUTTON",
    TEXT: "TEXT",
    COLOR: "COLOR",
    TOGGLE: "TOGGLE",
    RANGE: "RANGE"
}

let HTMLGen = {
    HEADER: (s, store) => `<div class="setHed" id="setHed_Zeno_${s.id}" onclick="window.windows[0].collapseFolder(this)"><span class="material-icons plusOrMinus">keyboard_arrow_down</span> ${s.label}</div>`,
    BUTTON: (s, store) => `<div class="settName zenoSetting"style="display:block"><span>${s.label}${s.requireRestart ? "*" : ""}</span><a class="+" id="${s.buttonId}">${s.buttonLabel}</a></div>`,
    TEXT: (s, store) => {
        if(!s.storeKey) return `<div class="settName zenoSetting"style="display:block"><span>${s.label}${s.requireRestart ? "*" : ""}</span><a class="+" id="${s.buttonId}">${s.buttonLabel}</a><input type="text" placeholder="${s.inputLabel}" name="url" class="inputGrey2" id="${s.inputId}"></div>`;
        let value = store.get(s.storeKey) ? `value="${store.get(s.storeKey)}"` : ``;
        return `<div class="settName zenoSetting"style="display:block"><span>${s.label}${s.requireRestart ? "*" : ""}</span><a class="+" id="${s.buttonId}">${s.buttonLabel}</a><input type="text" placeholder="${s.inputLabel}" ${value} name="url" class="inputGrey2" id="${s.inputId}"></div>`
    },
    COLOR: (s, store) => `<div class="settName">${s.label}${s.requireRestart ? "*" : ""}<input type="color" name="color" id="${s.buttonId}" style="float:right" value="${s.value instanceof Function ? s.value() : store.get(s.storeKey)}"></div>`,
    TOGGLE: (s, store) => `<div class="settName">${s.label}${s.requireRestart ? "*" : ""}<label class="switch" style="margin-left:10px"><input type="checkbox" id="${s.buttonId}" ${(store.get(s.storeKey) == true) ? "checked" : ""}><span class="slider"></span></label></div>`,
    RANGE: (s, store) => `<div class="settName" title="">${s.label}${s.requireRestart ? "*" : ""}<input type="number" class="sliderVal" id="slid_input_${s.id}" min="${s.min}" max="${s.max}" value="${store.get(s.storeKey) || s.value}" style="margin-right:0px;border-width:0px"><div class="slidecontainer" style=""><input type="range" id="slid_${s.id}" min="${s.min}" max="${s.max}" step="${s.step}" value="${store.get(s.storeKey) || s.value}" class="sliderM"></div></div>`
}

let FuncReg = {
    BUTTON: (s, store) => { getID(s.buttonId).addEventListener('click', () => s.cb(store)) },
    TEXT: (s, store) => { getID(s.buttonId).addEventListener('click', () => s.cb(getID(s.inputId).value, store)) },
    COLOR: (s, store) => { getID(s.buttonId).addEventListener('input', () => s.cb(getID(s.buttonId).value, store))},
    TOGGLE: (s, store) => { getID(s.buttonId).addEventListener('click', e => s.cb(e.target.checked, store)) },
    RANGE: (s, store) => {
        getID("slid_" + s.id).addEventListener('input', e => {
            s.cb(e.target.value, store);
            getID("slid_input_" + s.id).value = e.target.value;
        });
        getID("slid_input_" + s.id).addEventListener('input', e => {
            s.cb(e.target.value, store);
            getID("slid_" + s.id).value = e.target.value;
        });
    }
}

// Array for looping over all settings
let Settings = [
    { //Gameplay
        label: "Gameplay",
        id: "gameplay",
        items: [
            { // Scout Mode
                type: Types.TOGGLE,
                label: "Scout Mode",
                buttonId: "ScoutModeToggle_btn",
                storeKey: "ScoutMode",
                cb: (checked) => { 
                    store.set("ScoutMode", checked);
                
                    let instructions = getID("instructions");
                
                    let specBtn = getClass("switchsml", 1).children[0];
                    window.toggleSpect(checked);
                    specBtn.checked = checked;
                    instructions.innerHTML = checked ? "Click To Scout Lobby" : "Click To Play";
                
                    new MutationObserver(() => {
                        let instruction = specBtn.checked ? "Click To Scout Lobby" : "Click To Play";
                        if(instructions.textContent.toLowerCase() == instruction.toLowerCase()) return;
                        instructions.innerHTML = instruction;
                    }).observe(instructions, { childList: true });
                
                    return;
                }
            }, { // Sky Color Toggle
                type: Types.TOGGLE,
                label: "Sky Color Toggle",
                buttonId: "SkyColorToggle_btn",
                storeKey: "SkyColorToggle",
                cb: (checked) => store.set("SkyColorToggle", checked),
                requireRestart: true
            }, { // Sky Color Picker
                type: Types.COLOR,
                label: "Sky Color Picker",
                buttonId: "SkyColor_btn",
                storeKey: "SkyColor",
                cb: (value) => {
                    setTimeout(() => {
                        store.set("SkyColor", value);
                    }, 0);
                },
                requireRestart: true
            }
        ]
    }, { // Preferences
        label: "Preferences",
        id: "preferences",
        items: [
            { // Custom Logo
                type: Types.TEXT,
                label: "Custom Logo",
                inputLabel: "Logo URL",
                inputId: "logosp",
                buttonLabel: "Change",
                buttonId: "ChangeLogo_btn",
                storeKey: "imgTag",
                cb: (imgurl) => {
                    if (!imgurl) {
                        store.set("imgTag", "");
                        getID("mainLogo").src = "https://cdn.discordapp.com/attachments/792583760666165249/792585775228387358/Zeno-Logo.png";
                    } else {
                        store.set("imgTag", imgurl);
                        getID("mainLogo").src = imgurl;
                    }
                }
            }, { // Disable Stream Overlay
                type: Types.TOGGLE,
                label: "Disable Stream Overlay",
                buttonId: "StreamOverlayToggle_btn",
                storeKey: "StreamOverlay",
                cb: (checked) => store.set("StreamOverlay", checked)
            }
        ]
    }, { // Discord
        label: "Discord",
        id: "discord",
        items: [
            { // Discord Presence
                type: Types.TOGGLE,
                label: "Enable Discord Presence",
                buttonId: "DiscordPresenceToggle_btn",
                storeKey: "DiscordPresence",
                cb: (checked) => store.set("DiscordPresence", checked),
                requireRestart: true
            }, {
                type: Types.TOGGLE,
                label: "Enable Ask to Join",
                buttonId: "AskToJoinToggle_btn",
                storeKey: "AskToJoin",
                cb: (checked) => store.set("AskToJoin", checked)
            }
        ]
    }, { // Client
        label: "Client",
        id: "client",
        items: [
            { // Plugin Browser
                type: Types.BUTTON,
                label: "Plugin Browser",
                buttonLabel: "Open",
                buttonId: "PluginBrowser_btn",
                cb: window.openPluginBrowser
            }, { // CSS Editor
                type: Types.BUTTON,
                label: "CSS Editor",
                buttonLabel: "Open",
                buttonId: "CSSEditor_btn",
                cb: () => ipcRenderer.send("css-editor")
            }, { // Clear Cache
                type: Types.BUTTON,
                label: "Clear Cache",
                buttonLabel: "Clear",
                buttonId: "ClearCacheButton_btn",
                cb: () => ipcRenderer.send("ClearCache"),
                requireRestart: true
            }, { // VSync Toggle
                type: Types.TOGGLE,
                label: "Enable VSync",
                buttonId: "VSyncToggle_btn",
                storeKey: "VSync",
                cb: (checked) => store.set("VSync", checked),
                requireRestart: true
            }, { // Resource Swapper Toggle 
                type: Types.TOGGLE,
                label: "Resource Swapper",
                buttonId: "ResourceSwapperToggle_btn",
                storeKey: "RS",
                cb: (checked) => store.set("RS", checked),
                requireRestart: true
            }, { // Float Button Toggle
                type: Types.TOGGLE,
                label: "Show Cookie Button",
                buttonId: "FloatButtonToggle_btn",
                storeKey: "FloatButton",
                cb: (checked) => {
                    if(!checked) {
                        document.getElementById("float-button-disable").innerHTML = `#ot-sdk-btn-floating.ot-floating-button {display: none !important;}`;
                    } else {
                        document.getElementById("float-button-disable").innerHTML = "";
                    }
                }
            }, { // Random Class Button
                type: Types.TOGGLE,
                label: "Random Class Button",
                buttonId: "RandomClassToggle_btn",
                storeKey: "RandomClass",
                cb: (checked) => store.set("RandomClass", checked),
                requireRestart: true
            }, { // Zeno Badges
                type: Types.TOGGLE,
                label: "Zeno Badges",
                buttonId: "BadgesToggle_btn",
                storeKey: "Badges",
                cb: (checked) => store.set("Badges", checked),
                requireRestart: true
            }, { // Chat Mute
                type: Types.TOGGLE,
                label: "Chat Mute Feature",
                buttonId: "ChatMuteToggle_btn",
                storeKey: "ChatMute",
                cb: (checked) => store.set("ChatMute", checked),
                requireRestart: true
            }, { // Twitch Chat
                type: Types.TEXT,
                label: "Link Twitch Chat",
                inputLabel: "Twitch Channel Name",
                inputId: "twitchChannelName",
                buttonLabel: "Link",
                buttonId: "LinkTwitch_btn",
                cb: (value) => initTwitch(value)
            }
        ]
    }, { // Appearance
        label: "Appearance",
        id: "appearance",
        items: [
            { // Custom Theme Toggle
                type: Types.TOGGLE,
                label: "Use Custom Theme Colors",
                buttonId: "ThemeToggle_btn",
                storeKey: "theme_enabled",
                cb: (checked) => store.set("theme_enabled", checked),
                requireRestart: true,
            }, { // Main
                type: Types.COLOR,
                label: "Main Color",
                buttonId: "theme_main",
                storeKey: "theme_main",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--main").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_main", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--main", value);
                }
            }, { // Shadow
                type: Types.COLOR,
                label: "Shadow Color",
                buttonId: "theme_shadow",
                storeKey: "theme_shadow",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--shadow").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_shadow", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--shadow", value);
                }
            }, { // Button
                type: Types.COLOR,
                label: "Button Color",
                buttonId: "theme_button",
                storeKey: "theme_button",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--button").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_button", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--button", value);
                }
            }, { // Main UI
                type: Types.COLOR,
                label: "Main UI Color",
                buttonId: "theme_mainui",
                storeKey: "theme_mainui",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--main-ui").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_mainui", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--main-ui", value);
                }
            }, { // Menu Hover
                type: Types.COLOR,
                label: "Main Hover Color",
                buttonId: "theme_menuhover",
                storeKey: "theme_menuhover",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--menu-hover").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_menuhover", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--menu-hover", value);
                }
            }, { // UI Background
                type: Types.COLOR,
                label: "UI Background Color",
                buttonId: "theme_uibg",
                storeKey: "theme_uibg",
                value: () => window.getComputedStyle(document.documentElement).getPropertyValue("--ui-bg").replace(/ /, ""),
                cb: (value) => {
                    store.set("theme_uibg", value);
                    if(!store.get("theme_enabled")) return;
                    document.documentElement.style.setProperty("--ui-bg", value);
                }
            }
        ]
    }
];


window.openZenoWindow = e => {
    openHostWindow();
    loadSettings(Settings);
}

/**
 * Generates and shows UI for the Settings provided
 * @param {Array} Settings 
 */
function loadSettings(Settings){
    let settingsHTML = "";

    for(let group of Settings){
        settingsHTML += HTMLGen[Types.HEADER](group) + "\n";
        settingsHTML += `<div id="setBod_Zeno_${group.id}">`;
        for(let setting of group.items){
            settingsHTML += HTMLGen[setting.type](setting, store) + "\n";
        }
        settingsHTML += `</div>\n`;
    }

    getID('menuWindow').innerHTML = settingsHTML;

    for (let group of Settings){
        for(let setting of group.items) FuncReg[setting.type](setting, store);
    }
}

window.loadSettings = loadSettings;