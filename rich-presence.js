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

    // Listens for the local user accepting game invites in chat
    discordClient.subscribe("ACTIVITY_INVITE", ({secret}) => joinGame(secret));

    // Listens for the local user receiving an "Ask to Join Request"
    // The callback function is called with an object "data" which has a "user" object inside it
    discordClient.subscribe("ACTIVITY_JOIN_REQUEST", ({user}) => handleJoinRequest(user));

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

// Secret is the joinSecret of the Rich Presence activity which is set as the gameID
function joinGame(secret) {
    window.location.href = `https://krunker.io/?game=${secret}`;
}

// The object passed to this function is the "user" object which is then passed on as the different properties of the function
// I am currently using a stupid confirm dialog box for testing purposes
function handleJoinRequest({id, username, discriminator, avatar}){
    window.confirm(`${username}#${discriminator} wants to join your game!`)
        ? () => {
            discordClient.request("SEND_ACTIVITY_JOIN_INVITE", { user_id: id });
        }
        : () => {
            discordClient.request("CLOSE_ACTIVITY_REQUEST", { user_id: id });
        };
}

// Note:
// The RPCClient.request() function is private and now I realize while writing these comments that it won't work

exports.initDiscord = initDiscord;

//getGameActivity()