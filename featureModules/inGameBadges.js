// big brain in game badges by hitthemoney#1337
const Store = require("electron-store");
const store = new Store();
const {
    badgeUrls
} = require('../consts.js');
let badgeData = {},
    badgePlayers = [];

let iconSize = 30;

module.exports = async () => {
    hookCanvasCtx();
    window.zenoBadgeData = await fetch("https://zenokrunkerapi.web.app/badgeData.json").then(data => data.json())
    badgeData = window.zenoBadgeData;
    for (key in badgeData) {
        let elem = badgeData[key];
        badgePlayers.push(elem)
    }
    badgePlayers = [...new Set(badgePlayers.flat(Infinity))]
}

function hookCanvasCtx() {
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    window.CanvasRenderingContext2D.prototype.fillText = function (...args) {
        if (badgePlayers.includes(args[0]) && store.get("InGameBadges")) {
            let offset = 0;
            for (key in badgeData) {
                let elem = badgeData[key];
                elem.forEach(ign => {
                    if (args[0] === ign) {
                        const image = new Image(iconSize, iconSize)
                        image.src = badgeUrls.get(key)
                        let tm = this.measureText(args[0])
                        this.drawImage(image, args[1] + tm.width + offset, args[2] + 7, iconSize, iconSize)
                        offset += iconSize + 3
                    }
                })
            }
        }
        const ret = fillText.call(this, ...args);
    }
}

/* Object.assign(document.createElement("image"), {
    src: badgeUrls.get(type),
    width: iconSize,
    height: iconSize
}) */