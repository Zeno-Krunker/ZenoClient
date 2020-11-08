const { ipcRenderer: ipcRenderer, remote } = require("electron");
const http = require('http');
const fs = require('fs');

// ** REMEMBER THIS EVERY UPDATE, JUST INCREASE +1, TO TEST, DECREASE -1 **

const version = 18;

document.addEventListener('DOMContentLoaded', async(event) => {
    var status = document.getElementById('bottom');
    var json;
    console.log("before fetch");
    await fetch("https://zenokrunkerapi.web.app/latestVersion.json")
        .then((resp) => resp.json())
        .then((resp) => json = resp);
    console.log("after fetch");
    if (json.version > version) {
        status.innerHTML = 'Update Found. Downloading Update..';
        setTimeout(() => {
            process.noAsar = !0;
            download(`https://zenokrunkerapi.web.app/updates/${process.platform}/app.asar/`, __dirname, () => {
                status.innerHTML = 'Update Downloaded. Restarting...';
                setTimeout(() => {
                    ipcRenderer.send('restart-client');
                }, 2000);
            });
        }, 2000);
    } else {
        console.log("else statement");
        status.innerHTML = 'No Update Found';
        setTimeout(ipcRenderer.send('noUpdate'), 5000);
    }
});


var download = function(url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = http.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    }).on('error', function(err) {
        fs.unlink(dest);
        if (cb) cb(err.message);
    });
};