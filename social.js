/*
    Social.js Zeno Client 
    By : https://aryaveer.tk/
*/

// *** Import Modules ***
const { ipcRenderer: ipcRenderer } = require('electron')
const { readFile } = require('fs');
ipcRenderer.on('home', () => {
    window.location.href = 'https://krunker.io/social.html';
});
document.addEventListener('DOMContentLoaded', (event) => {
    (function() {
        'use strict';
        // *** Add CSS ***
        var insertCSS = () => {
            readFile(__dirname + '/social.css', "utf-8", (error, data) => {
                if (error) console.log(error);
                window.document.getElementsByTagName("head")[0].innerHTML += `<style>${data.replace(/\s{2,10}/g, ' ').trim()}</style>`;
            })
        }

        // *** Call Main Function ***

        var init = () => {
            insertCSS();
        }
        init()
    })();
});