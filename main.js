/*
    Main.js Zeno Client
    By : Zeno Client Team
*/

// *** The Modules ***
const { screen, app, BrowserWindow, shell, globalShortcut, ipcMain } = require("electron");
var { cpus } = require("os");
const Store = require("electron-store");
const { initCSSWin } = require("./cssEditor/main");
const { initSwapper, attachSwapper } = require("./featureModules/swapper");
const { writeFile } = require("fs");
const store = new Store();
var swapperList;
var logger = [];

// *** Options ***
const devTools = false;
const fullscreenOnload = false;

//#region Do Some FPS Tricks
if(!store.get("VSync", false)){
    app.commandLine.appendSwitch("disable-frame-rate-limit");
    app.commandLine.appendSwitch("disable-gpu-vsync");
}
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-breakpad");
app.commandLine.appendSwitch("disable-component-update");
app.commandLine.appendSwitch("disable-print-preview");
app.commandLine.appendSwitch("disable-metrics");
app.commandLine.appendSwitch("disable-metrics-repo");
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
    PopupWin.loadFile(`${__dirname}/autoUpdater/splash.html`);
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

app.on("before-quit", () => {
    if(logger.length > 0){
        let log = JSON.stringify(logger);
        writeFile(app.getPath("desktop") + "/zeno-log.txt", log, { encoding: "utf-8" }, console.log);
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
    if(devTools) win.webContents.openDevTools();
    if(store.get("logger")) win.webContents.on("console-message", (e, l, m ,n, s) => { if(s && !m.includes("WebGL")) logger.push([l, m, n, s]) });

    // *** If New window is Social ***
    win.webContents.on("new-window", initWin);

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
                newWin.webContents.once("dom-ready", () => setTimeout(() => newWin.show(), 600));
            }
            event.newGuest = newWin;
            newWin.removeMenu();
            newWin.webContents.on("new-window", initWin);
            attachSwapper(newWin, swapperList);
        }
    }

    // *** Set the Shortcuts ***
    globalShortcut.register("F11", () => { win.setSimpleFullScreen(!win.isSimpleFullScreen()) });

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
    win.webContents.on("did-finish-load", () => { win.setTitle("Krunker - Zeno Client") });

    if(store.get("RS")) swapperList = initSwapper(app);
    attachSwapper(win, swapperList);
}

function isSocial(rawUrl) {
    return new URL(rawUrl).pathname == "/social.html" ? true : false;
}
