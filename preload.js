/*
    Preload.js Zeno Client 
    By : https://aryaveer.tk/
*/

// *** Include Modules ***
const { ipcRenderer: ipcRenderer, remote } = require("electron");
const fs = require("fs");
const { readFile, readdir, stat, exists, mkdir } = fs;

const tmi = require('tmi.js');
const { copy, copySync } = require("fs-extra");
const Store = require("electron-store");
const store = new Store();
const rsData = require("./rsData.json");
const { initDiscord } = require("./rich-presence");
var badgeFile = __dirname + "/badgeData.json";
var badgeObj;
var badges = ["verified", "content-creators", "dev", "vip", "gfx"];
var badgeUrls = {
    verified: {
        url: "https://cdn.discordapp.com/attachments/747410238944051271/748572694705864896/badge-verified.png",
    },
    "content-creators": {
        url: "https://cdn.discordapp.com/attachments/747410238944051271/748574740830093473/badge-cc.png",
    },
    dev: {
        url: "https://cdn.discordapp.com/attachments/747410238944051271/748573364968226887/badge-dev.png",
    },
    vip: {
        url: "https://cdn.discordapp.com/attachments/747410238944051271/748572846845984868/badge-crown.png",
    },
    gfx: {
        url: "https://cdn.discordapp.com/attachments/747410238944051271/748576637225795614/badge-gfx.png",
    },
};

var badgeImplemented = {
    verified: false,
    "content-creators": false,
    dev: false,
    vip: false,
    gfx: false,
};

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

        var insertCSS = () => {
            // *** Inject CSS **
            readFile(__dirname + "/style.css", "utf-8", (error, data) => {
                if (!error) {
                    document
                        .getElementsByTagName("head")[0]
                        .insertAdjacentHTML(
                            "beforeend",
                            `<style id='injected'>${data
                .replace(/\s{2,10}/g, " ")
                .trim()}</style>`
                        );
                } else {
                    console.log(error);
                }
            });

            if (!store.get("imgTag")) store.set("imgTag", "");
            if (!store.get("account")) store.set("account", []);
            var scopeTemp = [
                "https://assets.krunker.io/pro_scope.png?build=7FIag",
                "https://assets.krunker.io/pro_ads.png?build=7FIag",
                "https://cdn.discordapp.com/attachments/747410238944051271/751464889205391470/scope3444_9.png",
                "https://cdn.discordapp.com/attachments/747410238944051271/751465128486240407/Jedi_scope_fixed.png",
                "https://cdn.discordapp.com/attachments/747410238944051271/751465296677699634/bluescope.png",
                "https://cdn.discordapp.com/attachments/747410238944051271/751465743744499792/20200524_135724.png",
            ];
            if (!store.get("scopesCurrent")) store.set("scopesCurrent", scopeTemp);

            readFile(badgeFile, "utf-8", (error, data) => {
                if (error) console.log(error);
                badgeObj = JSON.parse(data);
            });

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

            // *** Badges Features ***

            function checkPlayer() {
                if (typeof window.getGameActivity === 'function') {
                    badges.forEach((cur) => {
                        if (badgeObj[cur].indexOf(getGameActivity().user) != -1) {
                            if (!badgeImplemented[cur]) {
                                document
                                    .getElementsByClassName("menuClassPlayerName")[0]
                                    .insertAdjacentHTML(
                                        "beforebegin",
                                        `<img style="height:50px" src="` + badgeUrls[cur].url + `">`
                                    );
                                badgeImplemented[cur] = true;
                            }
                        }
                    });
                }
            }

            // *** Alt Manager ***

            new MutationObserver((mutations, observer) => {
                if (document.getElementsByClassName("menuClassPlayerName")[0]) {
                    checkPlayer();
                }
            }).observe(document, {
                chatList: true,
                subtree: true,
                attributes: true,
            });

            // *** Mute Feature ***

            window.muteList = [];

            new MutationObserver((mutations, observer) => {
                if (document.body && getID("windowHeader") && getID("chatList")) {
                    observer.disconnect();

                    window.mute = (a, b) =>
                        window.muteList.includes(a) ?
                        ((window.muteList = window.muteList.filter((b) => b !== a)),
                            (b.innerText = "Mute")) :
                        (window.muteList.push(a), (b.innerText = "Unmute"));
                    window.playerlistHandler = () => {
                        if ("Player List" == getID("windowHeader").innerText) {
                            for (const a of[...getID("menuWindow").children[1].children]) {
                                let b = [...a.children[0].children].filter(
                                        (a) => "A" == a.nodeName
                                    ),
                                    c = b[0] ? b[0].href.split("&q=")[1].trim() : null;
                                null !== c &&
                                    a.insertAdjacentHTML(
                                        "beforeend",
                                        `<span style="float:right"><span onmouseenter="playTick()" class="punishButton vote" onclick="mute('${c}', this)">${
                      window.muteList.includes(c) ? "Unmute" : "Mute"
                    }</span></span>`
                                    );
                            }
                        }
                    };
                    window.chatHandler = (a) => {
                        if (
                            0 < a[0].addedNodes.length &&
                            0 == a[0].removedNodes.length &&
                            a[0].addedNodes[0].innerText.includes(":")
                        ) {
                            let b = a[0].addedNodes[0].innerHTML
                                .split(`"chatItem">‎`)[1]
                                .split(`‎: <span`)[0]
                                .trim();
                            window.muteList.includes(b) && a[0].addedNodes[0].remove();
                        }
                    };
                    window.playerlistObserver = new MutationObserver(() =>
                        window.playerlistHandler()
                    ).observe(getID("windowHeader"), {
                        attributes: !0,
                        subtree: !0,
                        childList: !0,
                    });
                    window.chatObserver = new MutationObserver((a) =>
                        window.chatHandler(a)
                    ).observe(getID("chatList"), {
                        childList: !0,
                    });
                }
            }).observe(document, {
                chatList: true,
                subtree: true,
                attributes: true,
            });

            // *** Things to Do if Page Loads **

            var doIt = () => {
                getID("mainLogo").src =
                    store.get("imgTag") ||
                    "https://cdn.discordapp.com/attachments/747410238944051271/751466328262443169/FIXED.png";
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
                    '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.Css()" onmouseenter="playTick()">RS</div>'
                );
                getID("menuClassContainer").insertAdjacentHTML(
                    "beforeend",
                    '<div id="randomClass customizeButton" class="button bigShadowT mycustomButton" onmouseenter="playTick()" onclick="window.randomClass()">Random Class</div>'
                );

                if (document.querySelector('div[onclick="showWindow(5)').innerHTML.toLowerCase().includes('login or register')) {
                    if (!document.querySelector('body').innerHTML.includes(`document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');`)) {
                        document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');
                    }
                }
                const pluginDIR = remote.app.getPath("documents") + "/ZenoPlugins";

                exists(pluginDIR, (is) => {
                    if (!is) {
                        mkdir(pluginDIR, (error) => {
                            if (error) console.log(error);
                        });
                    }
                });

                getID('menuItemContainer').insertAdjacentHTML('beforeend', `
                <div class="menuItem" onmouseenter="playTick()" onclick="window.openZenoWindow()">
                <div class="menuItemIcon iconZeno"></div>
                <div class="menuItemTitle" id="menuBtnSocial">Zeno</div>
                </div>`)

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
                    readFile(plug + "/package.json", "utf-8", (error, data) => {
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
            };
        };

        // *** Run the Main Function ***

        var init = () => {
            initDiscord();
            insertCSS();
        };
        init();
    })();
});

var initTwitch = (channelName) => {
    const client = new tmi.Client({
        connection: {
            secure: true,
            reconnect: true
        },
        channels: [channelName]
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
        getID('chatList').insertAdjacentHTML('beforeend', `<div id="chatMsg_0"><div class="chatItem chatTextOutline twitch" style="background-color: rgba(0, 0, 0, 1)">&lrm;${tags['display-name']}&lrm;: <span class="chatMsg">&lrm;${message}&lrm;</span></div><br></div>`)
    });

}

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

// *** When Scope Bank Button is Pressed, Open Scope Bank ***

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
        var a = `<div class="classCard" onclick="window.selectScope(${i})"><img class="topRightBoi" onclick="window.removeScope(${i})" src="https://cdn.discordapp.com/attachments/747410238944051271/757255001314820186/Webp.png"><img class="classImgC" src="${scopeLink[i]}">`;
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

// *** Random Class Feature ***

window.randomClass = () => {
    var rand = Math.floor(Math.random() * (12 - 0 + 1));
    rand == 10 ? randomClass() : selectClass(rand);
};

// *** Open Resource Swapper and CSS Importer ***

// *** Check if its a New Instance ***

// *** Import CSS ***

window.Css = importCss = () => {
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
        let sf = remote.app.getPath("documents") + "/ZenoSwapper/";

        for (i in files) {
            copy(
                files[i].path,
                sf + rsData[files[i].name].address + files[i].name,
                function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        askRestart();
                    }
                }
            );
        }
    };
    importBtnn.addEventListener("click", () => {
        parseCSS(settingString.value);
    });

    // *** Set the CSS ***

    var parseCSS = (string) => {
        if (string) {
            try {
                document
                    .getElementsByTagName("head")[0]
                    .insertAdjacentHTML(
                        "beforeend",
                        `<style>${string.replace(/\s{2,10}/g, " ").trim()}</style>`
                    );
            } catch (err) {
                console.error(err);
                alert("Error importing CSS");
            }
        }
    };
};

var askRestart = () => {
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

// *** Add a New Scope to Scope Bank ***

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

// *** Remove a Scope from Scope Bank ***

window.removeScope = (no) => {
    var currentScopes = store.get("scopesCurrent");
    currentScopes.splice(no, 1);
    store.set("scopesCurrent", currentScopes);
    openHostWindow();
};

// *** Alt Manager ***

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

window.openZenoWindow = () => {
    openHostWindow();
    getID('menuWindow').innerHTML = `
    
    <div class="setHed">Import CSS</div>
    <div class="settName" id="importSettings_div" style="display:block">CSS Text <input type="url" placeholder="Paste Custom CSS Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtnn">Import</a>
    <div class="setHed">Change Logo</div><div class="settName" id="importSettings_div" style="display:block">Logo URL <input type="url" placeholder="Logo URL" name="url" class="inputGrey2" id="logosp"></div>
    <a class="+" id="changeBttt">Change</a>
    <div class="setHed">Link Twitch</div><div class="settName" id="importSettings_div" style="display:block">Twitch Channel Name <input type="url" placeholder="Twitch Name" name="url" class="inputGrey2" id="twitchChannelName"></div>
    <a class="+" id="changeBtttww">Link</a>
    `
    getID("changeBttt").addEventListener("click", () => {
        if (!getID("logosp").value) {
            store.set("imgTag", "");
            getID("mainLogo").src =
                "https://cdn.discordapp.com/attachments/747410238944051271/751466328262443169/FIXED.png";
        } else {
            store.set("imgTag", getID("logosp").value);
            getID("mainLogo").src = getID("logosp").value;
        }
    });

    getID('changeBtttww').addEventListener('click', () => {
        initTwitch(getID('twitchChannelName').value);
    })

    importBtnn.addEventListener("click", () => {
        var string = settingString.value;
        if (string) {
            try {
                document
                    .getElementsByTagName("head")[0]
                    .insertAdjacentHTML(
                        "beforeend",
                        `<style>${string.replace(/\s{2,10}/g, " ").trim()}</style>`
                    );
            } catch (err) {
                console.error(err);
                alert("Error importing CSS");
            }
        }
    });
}

// *** Simple Get ID Function ***

var getID = (id) => document.getElementById(id);