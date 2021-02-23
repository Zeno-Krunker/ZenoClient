/*
    Preload.js Zeno Client 
    By : Zeno Client Team
*/

// *** Include Modules ***
const { ipcRenderer, remote } = require("electron");
const fs = require("fs");
const { copy } = require("fs-extra");
const Store = require("electron-store");
const store = new Store();

// Local module / file imports
const rsData = require("./assets/rsData.json");
const { getID, getResourceSwapper, scopeTemp } = require('./consts.js');
const { initMute } = require('./featureModules/mute.js')
const randomClassInit = require("./featureModules/randomClass");
const { initExit } = require("./featureModules/exit");
const { ZenoEmitter, ZenoEvents } = require("./events");

window.home = () => window.location.href = "https://krunker.io/";

let escapeHandler = () => {
    if (!(endUI.style.display === "none")) {
        menuHolder.style.display = "block";
        menuHider.style.display = "block";
        endUI.style.display = "none";
        uiBase.classList.add("onMenu");
        instructionHolder.style.display = "block";
        overlay.style.display = "none";
    } else {
        document.exitPointerLock =
            document.exitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    }
};

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "F3": window.home(); break
        case "F4": window.location.reload(); break;
        case "F7": ipcRenderer.send("devtools"); break;
        case "Escape": escapeHandler(); break;
        default: break;
    }
});

ipcRenderer.on("home", window.home);
ipcRenderer.on("css", e => ipcRenderer.sendTo(e.senderId, "css", getID("custom-css").innerHTML.toString()));

function tryModule(moduleName) {
    const module = require("./featureModules/" + moduleName);
    try {
        module();
    } catch (err) {
        console.log(err)
    }
}
tryModule("sky");

document.addEventListener("DOMContentLoaded", (event) => {
    (function () {
        "use strict";

        var insertCSS = () => {
            // Zeno Theme CSS
            let cssFile = (store.get("RS") && fs.existsSync(getResourceSwapper(remote) + "css/main_custom.css")) ? getResourceSwapper(remote) + "css/main_custom.css" : __dirname + "/assets/css/main/default.css";
            fs.readFile(cssFile, "utf-8", (e, data) => {
                if (e) return console.log(e);
                document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='custom-css'></style>`);
                getID("custom-css").innerHTML = data;
            });

            // CSS Editor Event
            ipcRenderer.on("css-change", (e, css) => getID("custom-css").innerHTML = css);

            loadCustomTheme();

            // CSS for Custom Zeno UI
            fs.readFile(__dirname + "/assets/css/main/zeno-defaults.css", "utf-8", (e, data) => {
                if (e) return console.log(e);
                document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='zeno-defaults'>${data.replace(/\s{2,10}/g, " ").trim()}</style>`);
            });

            // Cookie Button CSS
            document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='float-button-disable'>#ot-sdk-btn-floating.ot-floating-button {display: none !important;}</style>`);

            try {
                if (!store.get("imgTag")) store.set("imgTag", "");
                if (!store.get("account")) store.set("account", []);
            } catch (err) {}

            // *** Mute Feature ***
            initMute();
        };

        var init = () => {
            insertCSS();
            if (store.get("DiscordPresence", true)) {
                const { initDiscord } = require("./featureModules/discordRPC");
                initDiscord();
            }
        };
        init();
    })();
});

// Things to do when the game loads
ZenoEmitter.on(ZenoEvents.GAME_LOADED, () => {
    var zenoIcon = "https://cdn.discordapp.com/attachments/792583760666165249/792585775228387358/Zeno-Logo.png";

    randomClassInit();
    initExit();
    require('./featureModules/plugins/loader')(ZenoEmitter);
    require("./featureModules/scoutMode");
    require("./featureModules/zenoSettings");
    require("./featureModules/altManager");

    getID('menuItemContainer').insertAdjacentHTML('beforeend', `
    <div class="menuItem" id="zenoMenuBtn" onmouseenter="playTick()" onclick="window.openZenoWindow()" ondblclick="window.openInstalledPlugins()">
    <div class="menuItemIcon iconZeno"></div>
    <div class="menuItemTitle" id="menuBtnSocial">Zeno</div>
    </div>`);

    getID("mainLogo").src = store.get("imgTag") || zenoIcon;

    getID("mapInfoHolder").children[3].insertAdjacentHTML(
        "beforeend",
        '<div class="verticalSeparatorInline"</div>',
    );
    getID("mapInfoHolder").children[3].insertAdjacentHTML(
        "beforeend",
        '<div class="terms" href="/" onclick="window.home()">QuickJoin</div>'
    );
    getID("menuClassContainer").insertAdjacentHTML(
        "beforeend",
        '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.rs()" onmouseenter="playTick()">RS</div>'
    );

    setInterval(() => {
        if (!store.get("StreamOverlay")) return;
        getID("streamContainer").innerHTML = "";
    }, 5000);
});

ZenoEmitter.on(ZenoEvents.GAME_ACTIVITY_LOADED, () => {
    // Badges
    if (store.get("Badges")) {
        const { initBadges } = require("./featureModules/badges");
        try { initBadges() } catch (err) { console.log(err) };
    }
    swapGameJoin();
});

//#region *** Custom Import Settings Menu ***
window.prompt = importSettings = () => {
    // *** Set The Inner HTML ***

    var tempHTML = `<div class="setHed">Import Settings</div>
    <div class="settName" id="importSettings_div" style="display:block">Settings String<input type="url" placeholder="Paste Settings String Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtn">Import</a>`;
    menuWindow.innerHTML = tempHTML;
    importBtn.addEventListener("click", () => {
        parseSettings(settingString.value);
    });

    // *** Parse Settings ***

    parseSettings = (string) => {
        if (string) {
            try {
                var json = JSON.parse(string);
                for (var setting in json) {
                    setSetting(setting, json[setting]);
                    showWindow(1);
                }
            } catch (err) {
                console.error(err);
                alert("Error importing settings.");
            }
        }
    };
};
//#endregion

//#region *** Resource Swapper ***
window.rs = importCss = () => {
    openHostWindow();
    var tempHTML = `
        <div id="drop-area">
    <form class="my-form">
    <p>Drop Your Resource Swapper Files Here</p><br><br><br>
    </form>
    </div>`;

    getID("menuWindow").innerHTML = tempHTML;

    // *** Drop Resource Swapper Code ***

    let dropArea = getID("drop-area");
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ["dragenter", "dragover"].forEach((eventName) => {
        dropArea.addEventListener(
            eventName,
            () => {
                dropArea.classList.add("highlight");
            },
            false
        );
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropArea.addEventListener(
            eventName,
            () => {
                dropArea.classList.remove("highlight");
            },
            false
        );
    });
    dropArea.addEventListener(
        "drop",
        (e) => {
            let dt = e.dataTransfer;
            let files = dt.files;

            handleFiles(files);
        },
        false
    );
    var handleFiles = (files) => {
        // *** Paste the Folder ***
        let sf = getResourceSwapper(remote);
        for (i in files) {
            var any = rsData[files[i].name].address;
            var temp = sf + any + files[i].name;
            copy(
                files[i].path,
                temp,
                function (err) {
                    if (err) return console.log(err);
                    askRestart();
                }
            );
        }
    };
};
//#endregion

//#region ** Ask Restart **
window.askRestart = () => {
    var tempHTML = `<div class="setHed">Restart Needed</div>
    <div class="settName" id="importSettings_div" style="display:block">The changes you made need the client to restart to take effect. Do you want to restart ?</div>
    <a class="+" id="notNowMoment">Not Now</a>
    <a class="+" id="okBoomerMoment" style="color:red;padding-left:10px;">Restart</a>`;
    getID("menuWindow").innerHTML = tempHTML;
    getID("notNowMoment").addEventListener("click", () => {
        openHostWindow();
        openHostWindow();
    });
    getID("okBoomerMoment").addEventListener("click", () => {
        ipcRenderer.send("restart-client");
    });
};

ipcRenderer.on("AskRestart", window.askRestart);
//#endregion

function swapGameJoin(){
    function getGameCode(string){
        let gamecode = string;
        // If its the whole URL, filter out just the game code
        try {
            let url = new URL(string);
            if(url.hostname != "krunker.io") return false;
            if(!url.search) return false;
            gamecode = url.search.slice(6, url.search.length);
        } catch {}
        if(/(BLR|BHN|SIN|TOK|AFR|SV|NY|SYD|FRA|BRZ|DAL|MIA|SEO):\w\w\w\w\w/.test(gamecode)) return gamecode;
        else return false;
    }

    getID("menuBtnJoin").onclick = undefined;
    getID("menuBtnJoin").addEventListener("click", () => {
        if(window.navigator.clipboard){
            window.navigator.clipboard.readText().then(url => {
                let gamecode = getGameCode(url);
                if(gamecode) window.location.href = "https://krunker.io/?game=" + gamecode;
                else showWindow(0x18);
            });
        } else showWindow(0x18);
    });

    window.joinGame = () => {
        let gamecode = getGameCode(getID("gameURL").value);
        if(gamecode) window.location.href = "https://krunker.io/?game=" + gamecode;
    }
}

function loadCustomTheme() {
    if(!store.get("theme_enabled")) return;
    store.get("theme_main") ? document.documentElement.style.setProperty("--main", store.get("theme_main")) : 0;
    store.get("theme_shadow") ? document.documentElement.style.setProperty("--shadow", store.get("theme_shadow")) : 0;
    store.get("theme_button") ? document.documentElement.style.setProperty("--button", store.get("theme_button")) : 0;
    store.get("theme_mainui") ? document.documentElement.style.setProperty("--main-ui", store.get("theme_mainui")) : 0;
    store.get("theme_menuhover") ? document.documentElement.style.setProperty("--menu-hover", store.get("theme_menuhover")) : 0;
    store.get("theme_uibg") ? document.documentElement.style.setProperty("--ui-bg", store.get("theme_uibg")) : 0;
}