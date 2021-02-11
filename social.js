/*
    Social.js Zeno Client 
    By : Zeno Client Team
*/

// *** Import Modules ***
const { ipcRenderer } = require('electron');
const { readFile } = require('fs');

window.home = () => window.location.href = 'https://krunker.io/social.html';

ipcRenderer.on('home', window.home);

window.addEventListener("keydown", e => {
    switch (e.key) {
        case "F3": window.home(); break
        case "F4": window.location.reload(); break;
        case "F7": ipcRenderer.send("devtools"); break;
        default: break;
    }
})

document.addEventListener('DOMContentLoaded', (event) => {
    (function() {
        'use strict';
        // *** Add CSS ***
        var insertCSS = () => {
            readFile(__dirname + '/css/social/social.css', "utf-8", (error, data) => {
                if (error) console.log(error);
                window.document.getElementsByTagName("head")[0].innerHTML += `<style>${data.replace(/\s{2,10}/g, ' ').trim()}</style>`;
            })
        }

        // *** Call Main Function ***

        var init = () => {
            insertCSS();
        }
        init();
    })();
});