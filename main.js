/*
    Main.js Zeno Client
    By : https://aryaveer.tk/
*/

// *** The Modules ***
const { screen, app, BrowserWindow, shell, globalShortcut } = require('electron');
var { cpus } = require('os');
const { format } = require('url');
const { readdirSync, mkdir, statSync } = require('fs');
const { register } = require('electron-localshortcut');

const devTools = false;

// *** Do Some FPS Tricks ***

app.commandLine.appendSwitch('disable-frame-rate-limit');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-print-preview');
app.commandLine.appendSwitch('disable-metrics');
app.commandLine.appendSwitch('disable-metrics-repo');
app.commandLine.appendSwitch('smooth-scrolling');
app.commandLine.appendSwitch('enable-javascript-harmony');
app.commandLine.appendSwitch('enable-future-v8-vm-features');
app.commandLine.appendSwitch('disable-hang-monitor');
app.commandLine.appendSwitch('no-referrers');
app.commandLine.appendSwitch('disable-2d-canvas-clip-aa');
app.commandLine.appendSwitch('disable-bundled-ppapi-flash');
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('disable-web-security');
app.commandLine.appendSwitch('webrtc-max-cpu-consumption-percentage=100');
if (cpus()[0].model.includes('AMD')) {
    app.commandLine.appendSwitch('enable-zero-copy')
}

var win = null;

function createGameWindow() {

    // *** Create the Game Window ***

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win = new BrowserWindow({
        backgroundColor: '#000000',
        webPreferences: {
            nodeIntergration: true,
            preload: `${__dirname}/preload.js`,
            webSecurity: false
        }
    });

    // *** If New window is Social ***

    win.webContents.on('new-window', (event, url, frameName, disposition, options) => {
        initWin(event, url, frameName, disposition, options);
    });

    function initWin(event, url, frameName, disposition, options) {
        if (!url) return;
        if (!isSocial(url)) {
            event.preventDefault();
            shell.openExternal(url);
            return;
        } else {
            event.preventDefault();
            const newWin = new BrowserWindow({
                width: width * 0.75,
                height: height * 0.9,
                webContents: options.webContents,
                show: false,
                webPreferences: {
                    nodeIntergration: true,
                    preload: `${__dirname}/social.js`,
                    webSecurity: false
                }
            });
            register(newWin, 'F7', () => {
                if (devTools) newWin.webContents.openDevTools();
            });
            newWin.once('ready-to-show', () => newWin.show());
            if (!options.webContents) {
                newWin.loadURL(url);
            }
            event.newGuest = newWin;
            newWin.removeMenu();
            if (devTools) win.webContents.openDevTools();
            newWin.webContents.on('new-window', (event, url, frameName, disposition, options) => {
                initWin(event, url, frameName, disposition, options);
            });
        }

    }

    function isSocial(rawUrl) {
        return new URL(rawUrl).pathname == '/social.html' ? true : false
    }

    // *** Set the Shortcuts ***

    register(win, 'Esc', () => {
        win.webContents.send('Escape');
    });
    register(win, 'F3', () => {
        win.webContents.send('home');
    });

    globalShortcut.register('F11', () => {
        win.setSimpleFullScreen(!win.isSimpleFullScreen());
    });
    globalShortcut.register('F3', () => {
        win.webContents.send('home');
    });
    globalShortcut.register('F5', () => {
        app.relaunch();
        app.quit()
    });
    globalShortcut.register('F7', () => {
        if (devTools) win.webContents.openDevTools();
    });
    register(win, 'F5', () => {
        app.relaunch();
        app.quit()
    });
    register(win, 'F11', () => {
        win.setSimpleFullScreen(!win.isSimpleFullScreen());
    });
    register(win, 'F7', () => {
        if (devTools) win.webContents.openDevTools();
    });
    if (devTools) win.webContents.openDevTools();
    win.setSimpleFullScreen(true);
    win.loadURL('https://krunker.io');
    win.removeMenu();

    // *** Resource Swapper Code ***

    let sf = `${app.getPath('documents')}/ZenoSwapper/`;

    try { mkdir(sf, { recursive: true }, e => {}); } catch (e) {};
    let s = { fltr: { urls: [] }, fls: {} };
    const afs = (dir, fileList = []) => {
        readdirSync(dir).forEach(file => {
            const fp = dir + '/' + file;
            if (statSync(fp).isDirectory()) {
                if (!(/\\(docs)$/.test(fp)))
                    afs(fp);
            } else {
                if (!(/\.(html|js)/g.test(file))) {
                    let k = '*://krunker.io' + fp.replace(sf, '').replace(/\\/g, '/') + '*';
                    s.fltr.urls.push(k);
                    console.log(fp)
                    s.fls[k.replace(/\*/g, '')] = format({
                        pathname: fp,
                        protocol: 'file:',
                        slashes: true
                    });
                }
            }
        });
    };
    afs(sf);
    if (s.fltr.urls.length) {
        win.webContents.session.webRequest.onBeforeRequest(s.fltr, (details, callback) => {
            callback({ cancel: false, redirectURL: s.fls[details.url.replace(/https|http|(\?.*)|(#.*)/gi, '')] || details.url });
        });
    }


}

// *** Run the Main Function ***

var init = () => {
    createGameWindow();
}

app.whenReady().then(() => {
    init()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) init()
    })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})