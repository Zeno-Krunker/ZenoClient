/*
    Main.js Zeno Client
    By : Zeno Client Team
*/

// *** The Modules ***
const {
    screen,
    app,
    BrowserWindow,
    shell,
    globalShortcut,
    ipcMain,
} = require("electron");
var { cpus } = require("os");
const { format } = require("url");
const { readdirSync, mkdir, statSync } = require("fs");
const Store = require("electron-store");
const store = new Store();

// *** Options ***

const devTools = true;
const fullscreenOnload = true;

// Do Some FPS Tricks

if(store.get("VSync") !== true){
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

var win = null;
var PopupWin = null;

function createGameWindow() {
    // *** Create the Game Window ***
    console.log('Window Creating...');

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    PopupWin = new BrowserWindow({
        icon: `${__dirname}/assets/icon/icon.ico`,
        height: Math.round(height / 2),
        width: Math.round(width / 2),
        frame: true,
        backgroundColor: "#000000",
        webPreferences: {
            nodeIntergration: true,
            preload: `${__dirname}/splash.js`,
            webSecurity: false,
        },
    });
    PopupWin.loadFile(`${__dirname}/splash.html`);
    console.log('Shortcuts Ended. Starting Resource Swapper');
    // *** Resource Swapper Code ***
    console.log('Resource Swapper Done');
}

// *** Run the Main Function ***

var init = () => {
    createGameWindow();
};

app.whenReady().then(() => {
    init();

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

function initMainWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        icon: `${__dirname}/assets/icon/icon.ico`,
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
    console.log('Window Created');
    if (devTools) win.webContents.openDevTools();

    // *** If New window is Social ***

    win.webContents.on(
        "new-window",
        (event, url, frameName, disposition, options) => {
            initWin(event, url, frameName, disposition, options);
        }
    );
    console.log('Added New Window Function');

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

            globalShortcut.register("F11", () => {
                win.setSimpleFullScreen(!win.isSimpleFullScreen());
            });
            globalShortcut.register("F3", () => {
                win.webContents.send("home");
            });
            globalShortcut.register("F5", () => {
                app.relaunch();
                app.quit();
            });
            globalShortcut.register("F7", () => {
                if (devTools) win.webContents.openDevTools();
            });
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
        }
    }

    function isSocial(rawUrl) {
        return new URL(rawUrl).pathname == "/social.html" ? true : false;
    }

    // *** Set the Shortcuts ***
    console.log('Shortcuts Starting');
    globalShortcut.register("F11", () => {
        win.setSimpleFullScreen(!win.isSimpleFullScreen());
    });
    globalShortcut.register("F3", () => {
        win.webContents.send("home");
    });
    globalShortcut.register("F5", () => {
        app.relaunch();
        app.quit();
    });
    globalShortcut.register("F7", () => {
        if (devTools) win.webContents.openDevTools();
    });

    globalShortcut.register("Esc", () => {
        win.webContents.send("Escape");
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
        console.log('Title Set');
    });
    initSwapper();
}

function initSwapper() {
    let sf = `${app.getPath("documents")}/ZenoSwapper`;

    try {
        mkdir(sf, { recursive: true }, (e) => {});
    } catch (e) {}
    let s = { fltr: { urls: [] }, fls: {} };
    const afs = (dir, fileList = []) => {
        readdirSync(dir).forEach((file) => {
            var fp;
            if (dir.endsWith("/")) {
                fp = dir + file;
            } else {
                fp = dir + "/" + file;
            }
            if (statSync(fp).isDirectory()) {
                if (!/\\(docs)$/.test(fp)) afs(fp);
            } else {
                if (!/\.(html|js)/g.test(file)) {
                    let k =
                        "*://krunker.io" + fp.replace(sf, "").replace(/\\/g, "/") + "*";
                    s.fltr.urls.push(k);
                    s.fls[k.replace(/\*/g, "")] = format({
                        pathname: fp,
                        protocol: "file:",
                        slashes: true,
                    });
                }
            }
        });
    };
    afs(sf);
    if (s.fltr.urls.length) {
        win.webContents.session.webRequest.onBeforeRequest(
            s.fltr,
            (details, callback) => {
                callback({
                    cancel: false,
                    redirectURL: s.fls[details.url.replace(/https|http|(\?.*)|(#.*)/gi, "")] ||
                        details.url,
                });
            }
        );
    }
}