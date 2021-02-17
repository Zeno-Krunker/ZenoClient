exports.initCSSWin = (parentId, css) => {
    const { screen, BrowserWindow, Menu, dialog } = require('electron');
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    let cssWin = new BrowserWindow({
        icon: `${__dirname}/icon/icon.ico`,
        height: Math.round(height * 0.75),
        width: Math.round(width * 0.75),
        webPreferences: {
            nodeIntergration: true,
            preload: `${__dirname}/preload.js`,
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
    });
    cssWin.loadFile(`${__dirname}/index.html`);
    cssWin.webContents.on("dom-ready", () => cssWin.webContents.send("cur-css", css, parentId));

    let menuTemp = [{
        label: "File",
        submenu: [
            {
                label: "Save",
                accelerator: "CommandOrControl+S",
                click: () => cssWin.webContents.send("save")
            }, {
                label: "Save As...",
                accelerator: "CommandOrControl+Shift+S",
                click: () => {
                    let path = dialog.showSaveDialogSync(cssWin, { defaultPath: "main_custom.css" });
                    if(path) cssWin.webContents.send("save-as", path);
                }
            }
        ]
    }];
    cssWin.setMenu(Menu.buildFromTemplate(menuTemp));
    return cssWin;
}