/*
    Main.js Zeno Client
    By : Zeno Client Team
*/

// *** The Modules ***
const { screen, app, BrowserWindow, shell, globalShortcut, ipcMain } = require("electron");
var { cpus } = require("os");
const { format } = require("url");
const { readdirSync, mkdir, statSync } = require("fs");
const path = require("path");
const Store = require("electron-store");
const { initCSSWin } = require("./cssEditor/main");
const store = new Store();
var s;

// *** Options ***
const devTools = false;
const fullscreenOnload = false;
let VSync = false;

//#region Do Some FPS Tricks
try {
    VSync = store.get("VSync", false);
} catch (err) {}

if(!VSync){
    app.commandLine.appendSwitch("disable-frame-rate-limit");
    app.commandLine.appendSwitch("disable-gpu-vsync");
}
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-breakpad");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-print-preview");
app.commandLine.appendSwitch("disable-metrics");
app.commandLine.appendSwitch("disable-metrics-repo");
app.commandLine.appendSwitch("use-angle", "d3d9");
app.commandLine.appendSwitch("smooth-scrolling");
app.commandLine.appendSwitch("enable-javascript-harmony");
app.commandLine.appendSwitch("enable-future-v8-vm-features");
app.commandLine.appendSwitch("enable-webgl2-compute-context");
app.commandLine.appendSwitch("disable-hang-monitor");
app.commandLine.appendSwitch("no-referrers");
app.commandLine.appendSwitch("renderer-process-limit", 100);
app.commandLine.appendSwitch("max-active-webgl-contexts", 100);
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("high-dpi-support", 1);
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-2d-canvas-clip-aa");
app.commandLine.appendSwitch("disable-bundled-ppapi-flash");
app.commandLine.appendSwitch("disable-logging");
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("webrtc-max-cpu-consumption-percentage=100");
if (cpus()[0].model.includes("AMD")) {
    app.commandLine.appendSwitch("enable-zero-copy");
}
//#endregion

var win = null;
var PopupWin = null;
var cssWin = null;

function createGameWindow() {
    // *** Create the Game Window ***
    const { width } = screen.getPrimaryDisplay().workAreaSize;
    PopupWin = new BrowserWindow({
        title: "Zeno Auto Updater",
        icon: `${__dirname}/assets/icon/icon.ico`,
        height: Math.round(width / 4),
        width: Math.round(width / 2),
        frame: false,
        resizable: false,
        movable: true,
        backgroundColor: "#2EA1A1",
        webPreferences: {
            nodeIntergration: true,
            preload: `${__dirname}/splash.js`,
            // webSecurity: false,
        },
    });
    PopupWin.loadFile(`${__dirname}/AutoUpdater/splash.html`);
}

// *** Run the Main Function ***

app.whenReady().then(() => {
    createGameWindow();
    app.on("activate", function() {
        if (BrowserWindow.getAllWindows().length === 0) init();
    });
});

app.on("window-all-closed", function() {
    if (process.platform !== "darwin") {
        app.quit();
        globalShortcut.unregisterAll();
    }
});

ipcMain.on("restart-client", () => {
    if (PopupWin) PopupWin.hide();
    app.relaunch();
    app.quit();
});

ipcMain.on("close-client", () => {
    app.quit();
});

ipcMain.on('noUpdate', () => {
    PopupWin.hide();
    initMainWindow();
});

ipcMain.on("ClearCache", () => {
    win.webContents.session.clearCache().then(() => {
        win.webContents.send("AskRestart");
    });
});

ipcMain.on("devtools", e => e.sender.webContents.openDevTools());

ipcMain.on("css-editor", e => { cssWin = initCSSWin(e.sender.id) });

function initMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        icon: `${__dirname}/icon/icon.ico`,
        height: Math.round(height * 0.75),
        width: Math.round(width * 0.75),
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntergration: false,
            preload: `${__dirname}/preload.js`,
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
    });
    if (devTools) win.webContents.openDevTools();

    // *** If New window is Social ***
    win.webContents.on(
        "new-window",
        (event, url, frameName, disposition, options) => {
            initWin(event, url, frameName, disposition, options);
        }
    );

    function initWin(event, url, frameName, disposition, options) {
        if (!url) return;
        if (!isSocial(url)) {
            event.preventDefault();
            shell.openExternal(url);
            return;
        } else {
            event.preventDefault();
            const newWin = new BrowserWindow({
                width: Math.round(width * 0.75),
                height: Math.round(height * 0.8),
                webContents: options.webContents,
                show: false,
                backgroundColor: "#131313",
                webPreferences: {
                    nodeIntergration: false,
                    preload: `${__dirname}/social.js`,
                    webSecurity: false,
                    devTools: true,
                },
            });

            if (devTools) newWin.webContents.openDevTools();

            if (!options.webContents) {
                newWin.loadURL(url);
                newWin.webContents.once("dom-ready", function() {
                    setTimeout(() => {
                        newWin.show();
                    }, 600);
                });
            }
            event.newGuest = newWin;
            newWin.removeMenu();
            newWin.webContents.on(
                "new-window",
                (event, url, frameName, disposition, options) => {
                    initWin(event, url, frameName, disposition, options);
                }
            );

            if (s?.filter.urls.length) {
                newWin.webContents.session.webRequest.onBeforeRequest(
                    s.filter,
                    (details, callback) => {
                        console.log(`Swapping ${details.url} with ${s.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, "")]}`);
                        callback({
                            cancel: false,
                            redirectURL: s.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, "")] ||
                                details.url,
                        });
                    }
                );
            }
        }
    }

    // *** Set the Shortcuts ***
    globalShortcut.register("F11", () => {
        win.setSimpleFullScreen(!win.isSimpleFullScreen());
    });

    globalShortcut.register("F5", () => {
        app.relaunch();
        app.quit();
    });

    win.on('close', () => {
        app.quit();
    })
    if (devTools) win.webContents.openDevTools();
    win.setSimpleFullScreen(fullscreenOnload);
    win.loadURL("https://krunker.io/");
    win.removeMenu();

    win.webContents.on("did-finish-load", () => {
        win.setTitle("Krunker - Zeno Client");
    });
    if(store.get("RS")) initSwapper();
}

function initSwapper() {
    let sf = `${app.getPath("documents")}/ZenoSwapper`;

    try {
        mkdir(sf, { recursive: true }, (e) => {});
    } catch (e) {}
    s = { filter: { urls: [] }, files: {} };
    const afs = (dir, fileList = []) => {
        readdirSync(dir).forEach((file) => {
            var filePath;
            if (dir.endsWith("/")) {
                filePath = dir + file;
            } else {
                filePath = dir + "/" + file;
            }
            if (statSync(filePath).isDirectory()) {
                if (!/\\(docs)$/.test(filePath)) afs(filePath);
            } else {
                if (!/\.(html|js)/g.test(file)) {
                    let k;
                    if(/\.(mp3)/g.test(file)){
                        k = "*://krunker.io" + filePath.replace(sf, "").replace(/\\/g, "/") + "*";
                    } else {
                        k = "*://assets.krunker.io" + filePath.replace(sf, "").replace(/\\/g, "/") + "*";
                    }
                    s.filter.urls.push(k);
                    s.files[k.replace(/\*/g, "")] = format({
                        pathname: filePath,
                        protocol: "file:",
                        slashes: true,
                    });
                }
            }
        });
    };
    afs(sf);
    if (s.filter.urls.length) {
        win.webContents.session.webRequest.onBeforeRequest(
            s.filter,
            (details, callback) => {
                callback({
                    cancel: false,
                    redirectURL: s.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, "")] ||details.url,
                });
            }
        );
    }
}

function isSocial(rawUrl) {
    return new URL(rawUrl).pathname == "/social.html" ? true : false;
}