// Discord Rich Presence for Zeno Client
// By TheDevKeval - Keval#8167
// mf don't you dare remove this...

const RPC = require("discord-rpc");

const discordClient = new RPC.Client({
    transport: "ipc"
});

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}

function initDiscord() {

    // Use Promises instead of Try Catch :kek:

    discordClient.login({
        clientId: "758353378547073055"
    }).then(null, (error) => {
        console.log(error);
    })

    discordClient.on("ready", () => {
        discordClient.setActivity({
            details: `${discordClient.user.username}`,
            state: "Started Playing",
            largeImageKey: "zeno_menu",
            largeImageText: "Zeno Client",
            smallImageKey: "zeno_dev",
            smallImageText: `${discordClient.user.username}#${discordClient.user.discriminator}`,
        });
    });

    setInterval(() => {
        updateDiscord();
    }, 1000);
}

var gameMode = null;
var mapName = null;
var className = null;
var timeLeft = null;
var gameActivity = null;

function updateDiscord() {
    gameActivity = window.getGameActivity();
    gameMode = gameActivity.mode;
    mapName = gameActivity.map;
    className = gameActivity.class.name;
    timeLeft = gameActivity.time;

    //console.log(timeLeft)

    if (gameMode == undefined || mapName == undefined || className == undefined)
        return console.log("Some Value is Undefined");

    discordClient.setActivity({
        details: `Playing ${gameMode}`,
        state: `on ${mapName}`,
        endTimestamp: Date.now() - timeLeft * 1000,
        largeImageKey: "zeno_menu",
        largeImageText: "Zeno Client",
        smallImageKey: `class_${className.toLowerCase()}`,
        smallImageText: className,
    });
}

exports.initDiscord = initDiscord;

//getGameActivity()