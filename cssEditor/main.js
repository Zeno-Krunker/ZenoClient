exports.initCSSWin = (parentId) => {
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
    cssWin.webContents.on("dom-ready", () => cssWin.webContents.send("init", parentId));

    let menuTemp = [
        {
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
        }, {
            label: "Edit",
            submenu: [
                {
                    label: "Find",
                    accelerator: "CommandOrControl+F",
                }, {
                    label: "Find Next",
                    accelerator: "CommandOrControl+G",
                }, {
                    label: "Find Previous",
                    accelerator: "Shift+CommandOrControl+G",
                }, {
                    label: "Replace",
                    accelerator: "Shift+CommandOrControl+F",
                }, {
                    label: "Replace All",
                    accelerator: "Shift+CommandOrControl+R",
                }
            ]
        }
    ];
    cssWin.setMenu(Menu.buildFromTemplate(menuTemp));
    return cssWin;
}