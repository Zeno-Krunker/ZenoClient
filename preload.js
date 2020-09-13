/*
    Preload.js Zeno Client 
    By : https://aryaveer.tk/
*/

// *** Include Modules ***
const { ipcRenderer: ipcRenderer, remote} = require('electron');
const { readFile } = require('fs');
const { copy } = require("fs-extra");
const Store = require('electron-store');
const store = new Store();

var badgeFile = __dirname + '/badgeData.json';
var badgeObj;
var badges = ['verified', 'content-creators', 'dev', 'vip', 'gfx']
var badgeUrls = {
    "verified": {
        "url": "https://cdn.discordapp.com/attachments/747410238944051271/748572694705864896/badge-verified.png"
    },
    "content-creators": {
        "url": "https://cdn.discordapp.com/attachments/747410238944051271/748574740830093473/badge-cc.png"
    },
    "dev": {
        "url": "https://cdn.discordapp.com/attachments/747410238944051271/748573364968226887/badge-dev.png"
    },
    "vip": {
        "url": "https://cdn.discordapp.com/attachments/747410238944051271/748572846845984868/badge-crown.png"
    },
    "gfx": {
        "url": "https://cdn.discordapp.com/attachments/747410238944051271/748576637225795614/badge-gfx.png"
    }
}

var badgeImplemented = {
    "verified": false,
    "content-creators": false,
    "dev": false,
    "vip": false,
    "gfx": false,
}

// *** Do Some Stuff **
ipcRenderer.on('Escape', () => {
    if (!(endUI.style.display === 'none')) {
        menuHolder.style.display = 'block';
        menuHider.style.display = 'block';
        endUI.style.display = 'none';
        uiBase.classList.add('onMenu');
        instructionHolder.style.display = 'block';
        overlay.style.display = 'none';
    } else {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    }
});

// *** Set Page HREF ***
ipcRenderer.on('home', () => {
    window.location.href = 'https://krunker.io/';
});

document.addEventListener('DOMContentLoaded', (event) => {
    (function() {
        'use strict';

        var insertCSS = () => {
            // *** Inject CSS **
            readFile(__dirname + '/style.css', "utf-8", (error, data) => {
                if (!error) {
                    document.getElementsByTagName("head")[0].insertAdjacentHTML('beforeend', `<style id='injected'>${data.replace(/\s{2,10}/g, ' ').trim()}</style>`)
                } else {
                    console.log(error)
                }
            })

            if (!store.get('imgTag')) store.set('imgTag', '')
            var chat = ["GG WP ", "Nice Game ", "Follow me on Krunker"]
            if (!store.get('chat')) store.set('chat', chat)
            var scopeTemp = ['https://assets.krunker.io/pro_scope.png?build=7FIag', 'https://assets.krunker.io/pro_ads.png?build=7FIag', 'https://cdn.discordapp.com/attachments/747410238944051271/751464889205391470/scope3444_9.png', 'https://cdn.discordapp.com/attachments/747410238944051271/751465128486240407/Jedi_scope_fixed.png', 'https://cdn.discordapp.com/attachments/747410238944051271/751465296677699634/bluescope.png', 'https://cdn.discordapp.com/attachments/747410238944051271/751465743744499792/20200524_135724.png']
            if (!store.get('scopesCurrent')) store.set('scopesCurrent', scopeTemp)


            readFile(badgeFile, "utf-8", (error, data) => {
                if (error) console.log(error)
                badgeObj = JSON.parse(data)
            })

            // *** Check if Page Loads using Observer ***
            new MutationObserver((mutationRecords, observer) => {
                if (getID('customizeButton')) {
                    observer.disconnect();
                    doIt();
                }
            }).observe(document, {
                childList: true,
                subtree: true,
                characterDataOldValue: true
            });

            // *** Badges Features ***

            function checkPlayer() {
                badges.forEach((cur) => {
                    if (badgeObj[cur].indexOf(document.getElementsByClassName('menuClassPlayerName')[0].innerHTML) != -1) {
                        if (!badgeImplemented[cur]) {
                            document.getElementsByClassName('menuClassPlayerName')[0].insertAdjacentHTML('beforebegin', `<img style="height:50px" src="` + badgeUrls[cur].url + `">`)
                            badgeImplemented[cur] = true;
                        }
                    }
                });
            }

            new MutationObserver((mutations, observer) => {
                if (document.getElementsByClassName('menuClassPlayerName')[0]) {
                    checkPlayer()
                }
            }).observe(document, {
                chatList: true,
                subtree: true,
                attributes: true
            })

            // *** Mute Feature ***

            window.muteList = [];

            new MutationObserver((mutations, observer) => {
                if (document.body && getID("windowHeader") && getID("chatList")) {
                    observer.disconnect();

                    window.mute = (a, b) => window.muteList.includes(a) ? (window.muteList = window.muteList.filter(b => b !== a), b.innerText = "Mute") : (window.muteList.push(a), b.innerText = "Unmute");
                    window.playerlistHandler = () => {
                        if ("Player List" == getID("windowHeader").innerText) {
                            for (const a of[...getID("menuWindow").children[1].children]) {
                                let b = [...a.children[0].children].filter(a => "A" == a.nodeName),
                                    c = b[0] ? b[0].href.split("&q=")[1].trim() : null;
                                null !== c && a.insertAdjacentHTML("beforeend", `<span style="float:right"><span onmouseenter="playTick()" class="punishButton vote" onclick="mute('${c}', this)">${window.muteList.includes(c)?"Unmute":"Mute"}</span></span>`)
                            }
                        }
                    }
                    window.chatHandler = (a) => {
                        if (0 < a[0].addedNodes.length && 0 == a[0].removedNodes.length && a[0].addedNodes[0].innerText.includes(":")) {
                            let b = a[0].addedNodes[0].innerHTML.split(`"chatItem">‎`)[1].split(`‎: <span`)[0].trim();
                            window.muteList.includes(b) && a[0].addedNodes[0].remove()
                        }
                    };
                    window.playerlistObserver = new MutationObserver(() => window.playerlistHandler()).observe(getID("windowHeader"), {
                        attributes: !0,
                        subtree: !0,
                        childList: !0
                    })
                    window.chatObserver = new MutationObserver(a => window.chatHandler(a)).observe(getID("chatList"), {
                        childList: !0
                    });
                }
            }).observe(document, {
                chatList: true,
                subtree: true,
                attributes: true
            })

            // *** Things to Do if Page Loads **

            var doIt = () => {
                getID('mainLogo').src = store.get('imgTag') ? store.get('imgTag') : 'https://cdn.discordapp.com/attachments/747410238944051271/751466328262443169/FIXED.png';
                getID('mapInfoHolder').children[3].insertAdjacentHTML('beforeend', '<a class="terms" href="/">&nbsp;QuickJoin&nbsp;</a><div style="font-size:20px;color:#fff;display:inline-block;">|</div>')
                getID('menuClassContainer').insertAdjacentHTML('beforeend', '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.scopes()" onmouseenter="playTick()">Scopes</div>');
                getID('menuClassContainer').insertAdjacentHTML('beforeend', '<div id="scopeSelect customizeButton" class="button bigShadowT mycustomButton" onclick="window.Css()" onmouseenter="playTick()">RS</div>');
                getID('menuClassContainer').insertAdjacentHTML('beforeend', '<div id="randomClass customizeButton" class="button bigShadowT mycustomButton" onmouseenter="playTick()" onclick="window.randomClass()">Random Class</div>');
                //updateChat()
            }
        }

        // *** Run the Main Function ***

        var init = () => {
            insertCSS();
        }
        init()
    })();
});

// *** Custom Import Settings Menu ***

window.prompt = importSettings = () => {

    // *** Set The Inner HTML ***

    var tempHTML = `<div class="setHed">Import Settings</div>
    <div class="settName" id="importSettings_div" style="display:block">Settings String<input type="url" placeholder="Paste Settings String Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtn">Import</a>`
    menuWindow.innerHTML = tempHTML;
    importBtn.addEventListener('click', () => {
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
                alert('Error importing settings.');
            }
        }
    }
}

// *** When Scope Bank Button is Pressed, Open Scope Bank ***

window.scopes = () => {
    scopeLink = store.get('scopesCurrent');
    // Open Menu
    openHostWindow();
    // Create Parent Window
    getID('menuWindow').innerHTML = '<div class="skinList" id="oo"></div>';
    var i = 0;
    var a;
    var scopeSize = parseInt(scopeLink.length);
    // Set the Scopes Using for Loop
    for (i = 0; i < scopeSize; i++) {
        var a = `<div class="classCard" onclick="window.selectScope(${i})"><img class="topRightBoi" onclick="window.removeScope(${i})" src="https://cdn.discordapp.com/attachments/747410238944051271/751495057122656407/Webp.net-resizeimage_1.png"><img class="classImgC" src="${scopeLink[i]}">`;
        getID('oo').insertAdjacentHTML('beforeend', a)
    }
    var a = '<div class="classCard" onclick="window.addScope()"><img class="classImgC" src="https://cdn.discordapp.com/attachments/747410238944051271/751466894481162351/1200px-Plus_symbol.png"></div>';
    getID('oo').insertAdjacentHTML('beforeend', a);
}

window.selectScope = (int) => {
    // If User Clicks a Scope, Set it as Scope Image
    setSetting('customScope', store.get('scopesCurrent')[int])
    openHostWindow()
}

// *** Random Class Feature ***

window.randomClass = () => {
    var rand = Math.floor(
        Math.random() * (12 - 0 + 1)
    )
    rand == 10 ? randomClass() : selectClass(rand)
}

// *** Open Resource Swapper and CSS Importer ***


// *** Check if its a New Instance ***

// *** Import CSS ***

window.Css = importCss = () => {
    openHostWindow()
    var tempHTML = `<div class="setHed">Import CSS</div>
    <div class="settName" id="importSettings_div" style="display:block">CSS Text <input type="url" placeholder="Paste Custom CSS Here" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtnn">Import</a>
    <div class="setHed">Change Logo</div>
    <div class="settName" id="importSettings_div" style="display:block">Logo URL <input type="url" placeholder="Logo URL" name="url" class="inputGrey2" id="logosp"></div>
    <a class="+" id="changeBttt">Change</a>
    <div id="drop-area">
    <form class="my-form">
    <p>Drop Your Resource Swapper Folder</p><br><br><br>
    </form>
    </div>`;

    getID('menuWindow').innerHTML = tempHTML;

    getID('changeBttt').addEventListener('click', () => {
        if (!getID('logosp').value) {
            store.set('imgTag', '')
            getID('mainLogo').src = 'https://cdn.discordapp.com/attachments/747410238944051271/751466328262443169/FIXED.png'
        } else {
            store.set('imgTag', getID('logosp').value)
            getID('mainLogo').src = getID('logosp').value;
        }
    })

    // *** Drop Resource Swapper Code ***

    let dropArea = getID('drop-area');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
        e.preventDefault()
        e.stopPropagation()
    };
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('highlight')
        }, false)
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('highlight')
        }, false)
    })
    dropArea.addEventListener('drop', () => {
        let dt = e.dataTransfer
        let files = dt.files

        handleFiles(files)
    }, false)
    var handleFiles = (files) => {

        // *** Paste the Folder ***

        let sf = remote.app.getPath('documents') + '/ZenoSwapper/'

        for (i in files) {
            copy(files[i].path, sf, function(err) {
                if (err) {
                    console.log('An error occured while copying the folder.')
                }
                console.log('Copy completed!')
            });

        }
    }
    importBtnn.addEventListener('click', () => {
        parseCSS(settingString.value);
    });

    // *** Set the CSS ***

    var parseCSS = (string) => {
        if (string) {
            try {
                document.getElementsByTagName("head")[0].insertAdjacentHTML('beforeend', `<style>${string.replace(/\s{2,10}/g, ' ').trim()}</style>`)
            } catch (err) {
                console.error(err);
                alert('Error importing CSS');
            }
        }
    }
}

// *** Add a New Scope to Scope Bank ***

window.addScope = () => {
    var tempHTML = `div class="setHed">Add Scope</div>
    <div class="settName" id="importSettings_div" style="display:block">Scope URL <input type="url" placeholder="Scope URL" name="url" class="inputGrey2" id="settingString"></div>
    <a class="+" id="importBtnnn">Add</a>
    </div>`;

    getID('menuWindow').innerHTML = tempHTML;
    var importBtnnn = getID('importBtnnn')
    importBtnnn.addEventListener('click', () => {
        parseScope(settingString.value);
    });

    var parseScope = (string) => {
        var present = store.get('scopesCurrent')
        present.push(string)
        store.set("scopesCurrent", present)
        openHostWindow();
    }
}

// *** Remove a Scope from Scope Bank ***

window.removeScope = (no) => {
    var currentScopes = store.get('scopesCurrent')
    currentScopes.splice(no, 1);
    store.set('scopesCurrent', currentScopes)
    openHostWindow();
}

// *** Simple Get ID Function ***

var getID = (id) => {
    return document.getElementById(id)
}