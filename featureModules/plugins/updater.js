const { remote } = require('electron');
const fs = require('fs');
const https = require('https');
const { resolve } = require('path');
const Unzipper = require('unzipper');

const pluginDIR = remote.app.getPath("documents") + "/ZenoPlugins/";

module.exports = async (status) => {
    status.innerHTML = "Looking for plugin updates..."

    // Making plugin directory if not present
    if (!fs.existsSync(pluginDIR)) {
        fs.mkdir(pluginDIR, (error) => {
            if (error) console.log(error);
        });
    }
    
    // Fetching plugin data from server
    let pluginData;
    await fetch("https://zenokrunkerapi.web.app/plugins.json")
        .then(resp => resp.json())
        .then(resp => pluginData = resp)
        .catch(console.log);

    // Check for Updates
    var directories = getDirectories(pluginDIR);
    console.log(directories);
    directories.forEach(plug => {
        if(plug.includes(".")) return;
        fs.readFile(plug + "/package.json", "utf-8", async (error, data) => {
            if (error) console.log(error);
            var plugConfig = JSON.parse(data);
            plugConfig.dir = plug;
            
            let pkgval = checkPluginData(plugConfig);
            if(pkgval.length != 0) return;

            let plugConfigS = pluginData.find(p => Number(p.id) == Number(plugConfig.id));
            if(!plugConfigS) return console.log(`Plugin ${plugConfig.name}(${plugConfig.id}) not found on Server.`);

            if(plugConfig.pVersion < plugConfigS?.version){
                status.innerHTML = "Updating " + plugConfigS.name;
                await updatePlugin(plugConfigS, plug).catch(e => status.innerHTML = e + plugConfigS.name).then(() => {
                    status.innerHTML = "Updated " + plugConfigS.name;
                });
            } else {
                console.log(`No update found for plugin ${plugConfigS.name}(${plugConfigS.id}).`);
            }
        });
    });
    return;
}

function updatePlugin(pluginConfigS, directory){
    return new Promise((res, rej) => {
        // Removing old files
        fs.rmdirSync(directory, { recursive: true });
    
        // Installing new files
        let url = `https://zenokrunkerapi.web.app/plugins/${pluginConfigS.filename}`;
        let dest = remote.app.getPath("documents") + `/ZenoPlugins/`;
        https.get(url, function(response) {
            if(response.statusCode != 200) {
                rej("Error while updating ");
                return;
            }

            let wStream = Unzipper.Extract({ path: dest })
                .on('close', () => {
                    res("Updated ");
                }).on('error', (err) => {
                    console.log(err);
                    rej("Error while updating ");
                });
    
            response.pipe(wStream);
            setInterval(() => console.log(wStream), 2000);
        }).on('error', function(err) {
            fs.unlink(dest);
            rej("Error while updating ");
        });
    });
}

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
    if(!pluginData.name) missing.push("name");
    if(pluginData.name && pluginData.name.length > 16) missing.push("name too long");
    if(!pluginData.author) missing.push("author");
    if(!pluginData.main) missing.push("main");    
    if(pluginData.pVersion === undefined) missing.push("pVersion");
    return missing;
}