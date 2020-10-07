/*
    Social.js Zeno Client 
    By : https://aryaveer.tk/ and https://hitthemoney.com
*/

// *** Import Modules ***
const { ipcRenderer: ipcRenderer } = require('electron');
const { readFile } = require('fs');
const { VanillaTilt } = require('./featureModules/vanilla-tilt-lib');
const { getID, getClass } = require("./consts");

ipcRenderer.on('home', () => {
    window.location.href = 'https://krunker.io/social.html';
});
document.addEventListener('DOMContentLoaded', (event) => {
    var socialCSS = "";

    (function() {
        'use strict';
        // *** Add CSS ***
        var insertCSS = () => {
            readFile(__dirname + '/social.css', "utf-8", (error, data) => {
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
            //initTilt();
        }
        init();
    })();
});

// Just can't get this working ffs
// Aryveer take a look ples

function initTilt() {
    //let marketList = getID("marketList");

    let marketCards;

    setInterval(() => {
        marketCards = getClass("marketCard");
        console.log("setInterval callback");
        console.log(marketCards);
        try{
            var tilty = new VanillaTilt(marketCards);
        } catch (err) {
            console.log(err);
        }
    }, 5000);
}