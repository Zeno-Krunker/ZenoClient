// Discord Rich Presence for Zeno Client
// By TheDevKeval - Keval#8167
// mf don't you dare remove this...

// Inglish Lebel 100

const RPC = require("discord-rpc");

const discordClient = new RPC.Client({
    transport: "ipc"
});

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

    discordClient.subscribe("ACTIVITY_INVITE", ({secret}) => joinGame(secret));

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
    gameID = gameActivity.id;

    //console.log(timeLeft)

    if (gameMode == undefined || mapName == undefined || className == undefined)
        return console.log("Some Value is Undefined");

    discordClient.setActivity({
        details: `Playing ${gameMode}`,
        state: `on ${mapName}`,
        endTimestamp: Date.now() + timeLeft * 1000,
        largeImageKey: "zeno_menu",
        largeImageText: "Zeno Client",
        smallImageKey: `class_${className.toLowerCase()}`,
        smallImageText: className,
        partyId: gameID,
        joinSecret: gameID,
    });
}

function joinGame(secret) {
    window.location.href = `https://krunker.io/?game=${secret}`;
}

exports.initDiscord = initDiscord;

//getGameActivity()