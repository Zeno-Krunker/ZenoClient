const https = require('https');
const fs = require('fs');
const { remote } = require('electron');
const Store = require('electron-store');
const store = new Store();
const Unzipper = require("unzipper");

const { getID } = require('../../consts');

let pluginData;
let installed = window.ZenoPlugins;
let disabled;

fetch("https://zenokrunkerapi.web.app/plugins.json")
        .then(resp => resp.json())
        .then(resp => pluginData = resp)
        .catch(console.log);

window.openPluginBrowser = async () => {
    await fetch("https://zenokrunkerapi.web.app/plugins.json")
        .then(resp => resp.json())
        .then(resp => pluginData = resp)
        .catch(console.log);

    if(getID("windowHolder").style?.display != "block"){
        window.openHostWindow();
    }

    let pluginsHTML = genPluginsHTML(pluginData, false);

    getID("menuWindow").innerHTML = `
    <div style="margin-bottom:15px;"><div class="menuTabsNew">
        <div class="menuTabNew" onclick="window.openInstalledPlugins()">Installed</div>
        <div class="menuTabNew tabANew">Download</div>
    </div></div>
    <div id="modList">${pluginsHTML}</div>`;
}

window.openInstalledPlugins = () => {
    if(getID("windowHolder").style?.display != "block"){
        window.openHostWindow();
    }

    disabled = store.get("DisabledPlugins");
    let pluginsHTML = genPluginsHTML(installed, true);
    getID("menuWindow").innerHTML = `
    <div style="margin-bottom:15px;"><div class="menuTabsNew">
        <div class="menuTabNew tabANew">Installed</div>
        <div class="menuTabNew" onclick="window.openPluginBrowser()">Download</div>
    </div></div>
    <div id="modList">${pluginsHTML}</div>`;
}

function genPluginsHTML(pluginData, installed) {
    let html = "";
    for(plugin of pluginData){
        if(!installed) {html += downloadPluginItem(plugin)}
        else {html += installedPluginItem(plugin)}
    }
    if(html == ""){
        html = `<center style="padding-top: 20px; padding-top: 20px"> Nothin' here! <br/> <img src="https://cdn.discordapp.com/attachments/792583760666165249/796041735134117938/peepoclown.png" style="width:200px;height:180px;margin-top:20px;"></img> </center>`
    }
    return html;
};

function downloadPluginItem(plugin) {
    if(installed.some(plug => plug.id == plugin.id)) return ``;
    return `
    <div class="mapListItem" style="margin: 0px !important">
        <div class="mapActionOvrl">
            <div class="mapActionHol">
                <div class="mapActionB" title="Install" onclick="window.installPlugin(${plugin.id})">
                    <span class="material-icons" style="font-size:50px;color:#fff;">get_app</span>
                </div>
                <div class="mapActionSep"></div>
                <div class="mapActionB sel" onclick="">
                    <span class="material-icons" title="${plugin.description}" style="font-size:50px;color:#fff;">info</span>
                </div>
            </div>
        </div>
        <div style="height:100px;width:220px;overflow: hidden;">
            <img class="mapListThumb" loading="lazy" src="${plugin.thumb}">
        </div>
        <div style="margin-top:1px">
            <a href="javascript:;" onclick="">${plugin.name}</a>
        </div>
        <div style="display:flex">
            <span class="mapByTxt"> by <a target="_blank" class="grey" href="/social.html?p=profile&amp;q=${plugin.maker}">${plugin.maker}</a></span>
        </div>
    </div>`
}

function installedPluginItem(plugin) {
    let dis = disabled.includes(Number(plugin.id));
    let plugx = pluginData.find(plug => plug.id == plugin.id);

    return `
    <div class="mapListItem" style="margin: 0px !important">
        <div class="mapActionOvrl">
            <div class="mapActionHol">
                <div class="mapActionB" title="${dis ? "Enable" : "Disable"}" onclick="window.togglePlugin(this, ${plugin.id})">
                    <span class="material-icons" style="font-size:50px;color:#fff;">${dis ? "play_arrow" : "stop"}</span>
                </div>
                <div class="mapActionSep"></div>
                <div class="mapActionB sel" onclick="">
                    <span class="material-icons" title="Settings" style="font-size:50px;color:#fff;" onclick="window.pluginSettings(${plugin.id})">settings</span>
                </div>
                <div class="mapActionSep"></div>
                <div class="mapActionB sel" onclick="">
                    <span class="material-icons" title="Uninstall" style="font-size:50px;color:#fff;" onclick="window.uninstallPlugin(${plugin.id})">delete</span>
                </div>
            </div>
        </div>
        <div style="height:100px;width:220px;overflow: hidden;">
            <img class="mapListThumb" loading="lazy" src="${plugx ? plugx.thumb : plugin.thumb}">
        </div>
        <div style="margin-top:1px">
            <a href="javascript:;" onclick="" style="">${plugx ? plugx.name : plugin.name}</a>
        </div>
        <div style="display:flex">
            <span class="mapByTxt"> by <a target="_blank" class="grey" href="/social.html?p=profile&amp;q=${plugx ? plugx.maker : plugin.author}">${plugx ? plugx.maker : plugin.author}</a></span>
        </div>
    </div>`
}

window.installPlugin = (id) => {
    let plugin = pluginData.find(plug => plug.id == id);
    if(!plugin) {
        getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Error Encountered! (Check console for details) <center>";
        throw new Error("Could not resolve plugin with ID " + id);
    };
    getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Downloading... <center>";
    downloadPlugin(plugin.filename, (err) => {
        if(err) {
            console.log(err);
            getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Error Encountered! (Check console for details) <center>";
            return;
        }
    });
}

function downloadPlugin(fileName, cb) {
    let url = `https://zenokrunkerapi.web.app/plugins/${fileName}`;
    let dest = remote.app.getPath("documents") + `/ZenoPlugins/`;
    var request = https.get(url, function(response) {
        if(response.statusCode != 200) {
            cb(new Error(`Server response ${response.statusCode} while downloading "${url}"`));
            return;
        }

        response.pipe(Unzipper.Extract({ path: dest })
            .on('close', () => {
                getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Plugin Installed! Reload page to load the plugin. <center>";
                cb();
            }).on('error', (err) => {
                console.log(err);
                getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Error Encountered! (Check console for details) <center>";
                cb();
            })
        );
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err);
    });
};

window.togglePlugin = (elem, id) => {
    let index = disabled.indexOf(id);
    if(index === -1){
        disabled.push(id);
        elem.firstElementChild.innerHTML = "play_arrow";
        console.log(`Plugins - Disabled [${id}]`);
    } else {
        disabled.splice(index, 1)
        elem.firstElementChild.innerHTML = "stop";
        console.log(`Plugins - Enable [${id}]`);
    };
    store.set("DisabledPlugins", disabled);
}

window.uninstallPlugin = (id) => {
    let plugin = installed.find(plug => plug.id == id);
    if(!plugin){
        getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Error Encountered! (Check console for details) <center>";
        throw new Error("Could not resolve plugin with ID " + id)
    }
    
    try {
        fs.rmdirSync(plugin.dir, { recursive: true });
        getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Plugin Uninstalled! Reload page to finish the process. <center>";
    } catch(err) {
        getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> Error Encountered! (Check console for details) <center>";
        console.log(err);
    }

}

window.pluginSettings = (id) => {
    let Settings = installed.find(p => p.id == id).settings;
    if(!Settings) return getID("menuWindow").innerHTML = "<center style='padding-top: 20px; padding-bottom: 20px'> No settings found for this plugin! </center>"
    window.loadSettings(Settings);
}