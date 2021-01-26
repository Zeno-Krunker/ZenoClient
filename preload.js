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
const rsData = require("./rsData.json");
const { getID, getResourceSwapper, scopeTemp } = require('./consts.js');
const { initMute } = require('./featureModules/mute.js')
const randomClassInit = require("./featureModules/randomClass");
const { initExit } = require("./featureModules/exit");
const { ZenoEmitter, ZenoEvents } = require("./events");

// *** Do Some Stuff **
ipcRenderer.on("Escape", () => {
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
});

// *** Set Page HREF ***
ipcRenderer.on("home", () => {
    window.location.href = "https://krunker.io/";
});

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
            window.customCSS = "";
            fs.readFile(__dirname + "/css/main/default.css", "utf-8", (error, data) => {
                if (!error) {
                    window.customCSS = data.replace(/\s{2,10}/g, " ").trim();
                    document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='custom-css'></style>`);
                    if (!store.get("ZenoCSS")) {
                        getID("custom-css").innerHTML = window.customCSS;
                    }
                }
            });


            // CSS for Custom Zeno UI
            fs.readFile(__dirname + "/css/main/zeno-defaults.css", "utf-8", (error, data) => {
                if (!error) {
                    document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='zeno-defaults'>${data.replace(/\s{2,10}/g, " ").trim()}</style>`);
                } else(console.log(error));
            });

            // Cookie Button CSS
            document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='float-button-disable'>#ot-sdk-btn-floating.ot-floating-button {display: none !important;}</style>`);

            try {
                if (!store.get("imgTag")) store.set("imgTag", "");
                if (!store.get("account")) store.set("account", []);
                if (!store.get("scopesCurrent")) store.set("scopesCurrent", scopeTemp);
            } catch (err) {}

            // *** Mute Feature ***
            initMute();
        };

        // *** Run the Main Function ***
        var init = () => {

            // Inserting Custom CSS
            insertCSS();

            // Discord Presence
            if (store.get("DiscordPresence", true)) {
                const {
                    initDiscord
                } = require("./featureModules/discordRPC");
                initDiscord();
            }
        };
        init();
    })();
});

// Things to do when the game loads
ZenoEmitter.on(ZenoEvents.GAME_LOADED, () => {
    var zenoIcon = "https://cdn.discordapp.com/attachments/792583760666165249/792585775228387358/Zeno-Logo.png"

    getID('menuItemContainer').insertAdjacentHTML('beforeend', `
    <div class="menuItem" onmouseenter="playTick()" onclick="window.openZenoWindow()">
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
        '<div class="terms" href="/" onclick="window.quickjoin()">QuickJoin</div>'
    );
    getID("menuClassContainer").insertAdjacentHTML(
        "beforeend",
        '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.rs()" onmouseenter="playTick()">RS</div>'
    );

    randomClassInit();
    initExit();
    require('./featureModules/plugins/loader');
    require("./featureModules/zenoSettings");
    require("./featureModules/scoutMode");

    setInterval(() => {
        if (!store.get("StreamOverlay")) return;
        getID("streamContainer").innerHTML = "";
    }, 5000);

    if (document.querySelector('div[onclick="showWindow(5)').innerHTML.toLowerCase().includes('login or register')) {
        if (!document.querySelector('body').innerHTML.includes(`document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');`)) {
            document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div id="buttonA" class="button buttonP lgn" style="margin-left: 7px;padding-top: 3px;padding-bottom: 15px;" onclick="window.openAltManager(true)">Alt Manager</div>');
        }
    }
});

ZenoEmitter.on(ZenoEvents.GAME_ACTIVITY_LOADED, () => {
    // Badges
    if (store.get("Badges")) {
        const { initBadges } = require("./featureModules/badges");
        try {
            initBadges();
        } catch (err) {
            console.log(err);
        }
    }
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

//#region  *** Alt Manager ***

window.openAltManager = (openNew) => {
    if (openNew) {
        showWindow(5);
    }
    var account = store.get("account");
    getID("menuWindow").innerHTML = '<div class="skinList" id="oo"></div>';
    var i = 0;
    var a;
    var accountInt = parseInt(account.length);
    for (i = 0; i < accountInt; i++) {
        var a = `<div class="classCard" onclick="window.selectAlt(${i})"><img class="topRightBoi" onclick="window.removeAlt(${i})" src="https://cdn.discordapp.com/attachments/747410238944051271/751495057122656407/Webp.net-resizeimage_1.png"><h3>${account[i].name}<br></h3>`;
        getID("oo").insertAdjacentHTML("beforeend", a);
    }
    var a =
        '<div class="classCard" onclick="window.addAlt()"><img id="addItem" class="classImgC" src="https://cdn.discordapp.com/attachments/747410238944051271/751466894481162351/1200px-Plus_symbol.png"></div>';
    getID("oo").insertAdjacentHTML("beforeend", a);
};

window.selectAlt = (i) => {
    var account = store.get("account");
    showWindow(5);
    showWindow(5);
    getID("accName").value = account[i].name;
    getID("accPass").value = account[i].pass;
    loginAcc();
};

window.removeAlt = (i) => {
    var account = store.get("account");
    account.splice(i, 1);
    store.set("account", account);
    openAltManager();
};

window.addAlt = () => {
    var tempHTML = `<div class="setHed">Add Alt</div>
    <div class="settName" id="importSettings_div" style="display:block">Account Name <input type="url" placeholder="Account Name" name="url" class="inputGrey2" id="usernameAlt"></div>
    <div class="settName" id="importSettings_div" style="display:block">Account Password <input type="password" placeholder="Account Password" name="url" class="inputGrey2" id="passwordAlt"></div>
    <a class="+" id="addAltB">Add</a>
    </div>`;

    getID("menuWindow").innerHTML = tempHTML;
    getID("addAltB").addEventListener("click", () => {
        var account = store.get("account");
        var newAlt = {
            name: getID("usernameAlt").value,
            pass: getID("passwordAlt").value,
        };
        account.push(newAlt);
        store.set("account", account);
        window.openAltManager(false);
    });
};

//#endregion

window.quickjoin = () => {
    window.location.href = "https://krunker.io/";
}