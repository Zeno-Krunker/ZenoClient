const { ipcRenderer: ipcRenderer, remote } = require("electron");
const https = require('https');
const fs = require('fs');

// ** REMEMBER THIS EVERY UPDATE, JUST INCREASE +1, TO TEST, DECREASE -1 **

const version = 18;

document.addEventListener('DOMContentLoaded', (event) => {
    var status = document.getElementById('bottom');
    var json;

    fetch("https://zenokrunkerapi.web.app/latestVersion.json")
        .then((resp) => resp.json())
        .then((resp) => json = resp);

    setTimeout(() => {
        if (json && json.version > version) {
            status.innerHTML = 'Update Found. Downloading Update..';
            setTimeout(() => {
                process.noAsar = !0;

                let downloadURL = `https://zenokrunkerapi.web.app/updates/v${json.version}.asar`;

                download(downloadURL, __dirname + "/app.asar", () => {
                    status.innerHTML = 'Update Downloaded. Restarting...';
                    setTimeout(() => {
                        ipcRenderer.send('restart-client');
                    }, 2000);
                });
            }, 2000);
        } else {
            console.log("No Update Found");
            status.innerHTML = 'No Update Found';
            setTimeout(ipcRenderer.send('noUpdate'), 5000);
        }
    }, 10000);
});


var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};