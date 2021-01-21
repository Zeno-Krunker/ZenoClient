const { remote } = require('electron');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();
const disabled = store.get("DisabledPlugins");

const pluginDIR = remote.app.getPath("documents") + "/ZenoPlugins";

if (!fs.existsSync(pluginDIR)) {
    fs.mkdir(pluginDIR, (error) => {
        if (error) console.log(error);
    });
}

var directories = getDirectories(pluginDIR);
let ZenoPlugins = [];
directories.forEach((plug) => {
    fs.readFile(plug + "/package.json", "utf-8", (error, data) => {
        if (error) console.log(error);
        var plugConfig = JSON.parse(data);
        plugConfig.dir = plug;
        
        let pkgval = checkPluginData(plugConfig);
        if(pkgval.length != 0) {
            console.error(`Failed to load plugin "${plugConfig.name}"\n The following properties were missing from "${plug}/package.json" - \n ${pkgval.join(", ")}`);
            return;
        }

        ZenoPlugins.push(plugConfig);

        if(disabled.includes(Number(plugConfig.id))) return;

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

window.ZenoPlugins = ZenoPlugins;

function getDirectories(path) {
    return fs
        .readdirSync(path)
        .filter(function (file) {
            return fs.statSync(path + "/" + file, (error, stat) => {
                return stat.isDirectory();
            });
        })
        .map((name) => pluginDIR + "/" + name);
}

function checkPluginData(pluginData) {
    let missing = [];
    if(pluginData.id === undefined) missing.push ("id");
    if(!pluginData.name) missing.push ("name");
    if(!pluginData.author) missing.push("author");
    if(!pluginData.main) missing.push("main");    
    return missing;
}