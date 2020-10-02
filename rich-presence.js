// Discord Rich Presence for Zeno Client
// By TheDevKeval - Keval#8167
// mf don't you dare remove this...

const RPC = require("discord-rpc");

const discordClient = new RPC.Client({
    transport: "ipc"
});

function initDiscord() {
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

    discordClient.subscribe("ACTIVITY_INVITE", ({ secret }) => joinGame(secret));

    discordClient.subscribe("ACTIVITY_JOIN_REQUEST", ({ user }) => handleJoinRequest(user));

    setInterval(() => {
        updateDiscord();
    }, 1000);
}

var gameMode = null;
var mapName = null;
var className = null;
var timeLeft = null;
var time = null;
var gameActivity = null;

function updateDiscord() {
    if (typeof window.getGameActivity === 'function') {
        gameActivity = window.getGameActivity();
        gameMode = gameActivity.mode;
        mapName = gameActivity.map;
        className = gameActivity.class.name;
        timeLeft = gameActivity.time;

        if (gameMode == undefined || mapName == undefined || className == undefined) { return console.log("Not Loaded") } else {
            discordClient.setActivity({
                details: `Playing ${game}`,
                state: `on ${map}`,
                endTimestamp: Date.now() + time * 1000,
                largeImageKey: "zeno_menu",
                largeImageText: "Zeno Client",
                smallImageKey: `class_${className.toLowerCase()}`,
                smallImageText: className,
                partyId: id,
                joinSecret: id,
            });
        }
    }
}

function joinGame(secret) {
    window.location.href = `https://krunker.io/?game=${secret}`;
}

function handleJoinRequest({ id, username, discriminator, avatar }) {
    window.confirm(`${username}#${discriminator} wants to join your game!`) ?
        () => {
            discordClient.request("SEND_ACTIVITY_JOIN_INVITE", { user_id: id });
        } :
        () => {
            discordClient.request("CLOSE_ACTIVITY_REQUEST", { user_id: id });
        };
}

exports.initDiscord = initDiscord;

//getGameActivity()