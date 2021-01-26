const { ipcRenderer: ipcRenderer, remote } = require("electron");
const https = require('https');
const fs = require('fs');
const pluginUpdater = require("./featureModules/plugins/updater");

// ** REMEMBER THIS EVERY UPDATE, JUST INCREASE +1, TO TEST, DECREASE -1 **

const version = 27;
var downloadBtn, cancelBtn, status;
let tips = [
    "You can press F5 to restart the client",
    "Use F3 to quickly join a new lobby",
    "Press F7 to open Developer Tools",
    "Press F11 to toggle Fullscreen Mode",
    "Use F4 to Reload Same Lobby"
]

document.addEventListener('DOMContentLoaded', (event) => {

    let tipHolder = document.getElementById('tips');
    let tip = tips[Math.round(Math.random() * (tips.length - 1))];
    tipHolder.innerHTML = `Tip: ${tip}`;

    status = document.getElementById('status');
    downloadBtn = document.getElementById('download');
    cancelBtn = document.getElementById('cancel');
    var json;

    status.innerHTML = `Checking for updates (Current - v${version})`;

    fetch("https://zenokrunkerapi.web.app/latestVersion.json")
        .then((resp) => resp.json())
        .then((resp) => json = resp);

    setTimeout(() => {
        if (json && json.version > version) {
            status.innerHTML = `New Update Found! (Release v${json.version}) Download now?`;
            downloadBtn.style.display = "block";
            cancelBtn.style.display = "block";

            downloadBtn.addEventListener("click", () => {
                process.noAsar = !0;
                let downloadURL = `https://zenokrunkerapi.web.app/updates/v${json.version}.asar`;
                status.innerHTML = "Downloading Update... (Do NOT close the client)";
                downloadBtn.style.display = "none";
                cancelBtn.style.display = "none";

                let dest = __dirname.endsWith(".asar") ? __dirname : __dirname + "/app.asar";
                
                try {
                    download(downloadURL, dest, () => {
                        status.innerHTML = 'Update Downloaded. Restarting...';
                        setTimeout(() => {
                            ipcRenderer.send('restart-client');
                        }, 2000);
                    });
                } catch (err) {
                    console.log(err);
                    status.innerHTML = 'Something went wrong! Click the cancel button to proceed with the older version.';
                    cancelBtn.style.display = "block";
                }
            });

            cancelBtn.addEventListener("click", () => {
                ipcRenderer.send('noUpdate');
            });
        } else {
            console.log("No Update Found");
            status.innerHTML = 'No Update Found';
            pluginUpdater(status).then(() => {setTimeout(() => ipcRenderer.send('noUpdate'), 5000)});            
        }
    }, 2000);
});


var download = function(url, dest, cb) {

    var request = https.get(url, function(response) {
        // Checking if the asar file exists on the remote server
        if(response.statusCode != 200) {
            status.innerHTML = 'Something went wrong! Click the cancel button to proceed with the older version.';
            cancelBtn.style.display = "block";
            console.log(response);
            return;
        }

        let fileSize = response.headers["content-length"];
        var file = fs.createWriteStream(dest);

        setInterval(() => {
            status.innerHTML = `Downloading Update... (Do NOT close the client) ${Math.round(file.bytesWritten / fileSize * 100)}%`;
        }, 1000);

        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};