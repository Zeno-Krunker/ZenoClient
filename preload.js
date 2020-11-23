/*
    Preload.js Zeno Client 
    By : Zeno Client Team
*/

// *** Include Modules ***
const { ipcRenderer: ipcRenderer, remote } = require("electron");
const fs = require("fs");
const { copy } = require("fs-extra");
const Store = require("electron-store");
const store = new Store();

// Local module / file imports
const rsData = require("./rsData.json");
const { getID, getPluginDIR, getResourceSwapper, scopeTemp } = require('./consts.js');
const { initMute } = require('./featureModules/mute.js')
const randomClassInit = require("./featureModules/randomClass");
const { initExit } = require("./featureModules/exit");
require("./featureModules/zenoSettings");
const { initEmitter } = require("./events");

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

document.addEventListener("DOMContentLoaded", (event) => {
    (function() {
        "use strict";
        var zenoIcon = "https://cdn.discordapp.com/attachments/747410238944051271/756312703374590002/Zeno.png" // https://cdn.discordapp.com/attachments/747410238944051271/756312661469167686/Zeno.svg

        var insertCSS = () => {
            // Zeno Theme CSS
            if(!store.get("ZenoCSS")){
                window.customCSS = "";
                fs.readFile(__dirname + "/css/main/default.css", "utf-8", (error, data) => {
                    if (!error) {
                        window.customCSS = data.replace(/\s{2,10}/g, " ").trim();
                        document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='custom-css'>${window.customCSS}</style>`);
                    }
                });
            }

            // CSS for Custom Zeno UI
            fs.readFile(__dirname + "/css/main/zeno-defaults.css", "utf-8", (error, data) => {
                if (!error) {
                    document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='zeno-defaults'>${data.replace(/\s{2,10}/g, " ").trim()}</style>`);
                } else (console.log(error));
            });

            // Cookie Button CSS
            document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", `<style id='float-button-disable'>#ot-sdk-btn-floating.ot-floating-button {display: none !important;}</style>`);
            console.log('CSS Injected');
            
            try {
                if (!store.get("imgTag")) store.set("imgTag", "");
                if (!store.get("account")) store.set("account", []);
                if (!store.get("scopesCurrent")) store.set("scopesCurrent", scopeTemp);
            } catch (err) {}

            initEmitter();

            // *** Check if Page Loads using Observer ***
            new MutationObserver((mutationRecords, observer) => {
                if (getID("customizeButton")) {
                    observer.disconnect();
                    doIt();
                }
            }).observe(document, {
                childList: true,
                subtree: true,
                characterDataOldValue: true,
            });
            console.log('DoIt Assigned');
            // *** Mute Feature ***

            initMute();

            console.log('Mute');

            // *** Things to Do if Page Loads **

            var doIt = () => {
                console.log('DoIt Started');

                getID('menuItemContainer').insertAdjacentHTML('beforeend', `
                <div class="menuItem" onmouseenter="playTick()" onclick="window.openZenoWindow()">
                <div class="menuItemIcon iconZeno"></div>
                <div class="menuItemTitle" id="menuBtnSocial">Zeno</div>
                </div>`)

                getID("mainLogo").src =
                    store.get("imgTag") ||
                    zenoIcon;
                getID("mapInfoHolder").children[3].insertAdjacentHTML(
                    "beforeend",
                    '<a class="terms" href="/">&nbsp;QuickJoin&nbsp;</a><div style="font-size:20px;color:#fff;display:inline-block;">|</div>'
                );
                getID("menuClassContainer").insertAdjacentHTML(
                    "beforeend",
                    '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.scopes()" onmouseenter="playTick()">Scopes</div>'
                );
                getID("menuClassContainer").insertAdjacentHTML(
                    "beforeend",
                    '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.rs()" onmouseenter="playTick()">RS</div>'
                );

                randomClassInit();

                initExit();

                setInterval(() => {getID("streamContainer").innerHTML = "";}, 5000);

                if (document.querySelector('div[onclick="showWindow(5)').innerHTML.toLowerCase().includes('login or register')) {
                    if (!document.querySelector('body').innerHTML.includes(`document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');`)) {
                        document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');
                    }
                }
                console.log('Plugin Started');
                const pluginDIR = getPluginDIR(remote);

                if (!fs.existsSync(pluginDIR)) {
                    fs.mkdir(pluginDIR, (error) => {
                        if (error) console.log(error);
                    });
                }

                function getDirectories(path) {
                    return fs
                        .readdirSync(path)
                        .filter(function(file) {
                            return fs.statSync(path + "/" + file, (error, stat) => {
                                return stat.isDirectory();
                            });
                        })
                        .map((name) => pluginDIR + "/" + name);
                }

                var directories = getDirectories(pluginDIR);
                directories.forEach((plug) => {
                    fs.readFile(plug + "/package.json", "utf-8", (error, data) => {
                        if (error) console.log(error);
                        var plugConfig = JSON.parse(data);
                        require(`${plug}/${plugConfig.main}`).onload({
                            gameURL: () => {
                                return window.location.href;
                            },
                            restart: () => {
                                ipcRenderer.send("restart-client");
                            },
                            close: () => {
                                ipcRenderer.send("close-client");
                            },
                        });
                    });
                });
                console.log('Plugin Ended');
            };
        };

        // *** Run the Main Function ***

        var init = () => {
            console.log('Starting Inits');

            // Inserting Custom CSS
            insertCSS();

            // Discord Presence
            if(store.get("DiscordPresence")){
                const { initDiscord } = require("./featureModules/richPresence");
                initDiscord();
            }

            // Badges
            if(store.get("Badges")){
                const { initBadges } = require("./featureModules/badges");
                initBadges();
            }
            console.log('Finished Inits');
        };
        init();
    })();
});

// *** Custom Import Settings Menu ***

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

// *** Resource Swapper ***

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
                function(err) {
                    if (err) return console.log(err);
                    askRestart();
                }
            );
        }
    };
};

// *** Scope Bank ***

window.scopes = () => {
    var scopeLink = store.get("scopesCurrent");
    // Open Menu
    openHostWindow();
    // Create Parent Window
    getID("menuWindow").innerHTML = '<div class="skinList" id="oo"></div>';
    var i = 0;
    var a;
    var scopeSize = parseInt(scopeLink.length);
    // Set the Scopes Using for Loop
    for (i = 0; i < scopeSize; i++) {
        var a = `<div class="classCard" onclick="window.selectScope(${i})"><img class="topRightBoi" onclick="window.removeScope(${i})" src="https://cdn.discordapp.com/attachments/756142725262213180/756353103581806602/Zeno_Exit.png"><img class="classImgC" src="${scopeLink[i]}">`;
        getID("oo").insertAdjacentHTML("beforeend", a);
    }
    var a =
        '<div class="classCard" onclick="window.addScope()"><img class="classImgC" src="https://cdn.discordapp.com/attachments/747410238944051271/751466894481162351/1200px-Plus_symbol.png"></div>';
    getID("oo").insertAdjacentHTML("beforeend", a);
};

window.selectScope = (int) => {
    // If User Clicks a Scope, Set it as Scope Image
    setSetting("customScope", store.get("scopesCurrent")[int]);
    openHostWindow();
};

window.addScope = () => {
    var tempHTML = `<div class="setHed">Add Scope</div>
    <div class="settName" id="importSettings_div" style="display:block">Scope URL <input type="url" placeholder="Scope URL" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtnnn">Add</a>
    </div>`;

    getID("menuWindow").innerHTML = tempHTML;
    var importBtnnn = getID("importBtnnn");
    importBtnnn.addEventListener("click", () => {
        parseScope(settingString.value);
    });

    var parseScope = (string) => {
        var present = store.get("scopesCurrent");
        present.push(string);
        store.set("scopesCurrent", present);
        openHostWindow();
    };
};

window.removeScope = (no) => {
    var currentScopes = store.get("scopesCurrent");
    currentScopes.splice(no, 1);
    store.set("scopesCurrent", currentScopes);
    openHostWindow();
};

// ** Ask Restart **

window.askRestart = () => {
    var tempHTML = `<div class="setHed">Restart Needed</div>
    <div class="settName" id="importSettings_div" style="display:block">The Changes you Made Need Restart to Take Effect. Do you want to Restart ?</div>
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
        '<div class="classCard" onclick="window.addAlt()"><img class="classImgC" src="https://cdn.discordapp.com/attachments/747410238944051271/751466894481162351/1200px-Plus_symbol.png"></div>';
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

// Zeno Window

