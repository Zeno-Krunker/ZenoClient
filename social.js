/*
    Social.js Zeno Client 
    By : Zeno Client Team
*/

// *** Import Modules ***
const { ipcRenderer: ipcRenderer } = require('electron');
const { readFile } = require('fs');

ipcRenderer.on('home', () => {
    window.location.href = 'https://krunker.io/social.html';
});
document.addEventListener('DOMContentLoaded', (event) => {
    var socialCSS = "";

    (function() {
        'use strict';
        // *** Add CSS ***
        var insertCSS = () => {
            readFile(__dirname + '/css/social.css', "utf-8", (error, data) => {
                if (error) console.log(error);
                socialCSS = data.split("/* Krunker Market Tools CSS */")[0];
                try {
                    darkModeFunc();
                } catch (err) {

                }
                window.document.getElementsByTagName("head")[0].innerHTML += `<style>${data.split("/* Krunker Market Tools CSS */")[1].replace(/\s{2,10}/g, ' ').trim()}</style>`;
            })
        }

        // *** Call Main Function ***

        var init = () => {
            insertCSS();
        }
        init();
    })();
});