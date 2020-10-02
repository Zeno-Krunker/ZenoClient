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
            smallImageKey: "zeno_menu",
            smallImageText: `${discordClient.user.username}#${discordClient.user.discriminator}`,
        });
    });

    /*discordClient.subscribe("ACTIVITY_INVITE", ({ secret }) => {
        window.location.href = `https://krunker.io/?game=${decrypt(secret)}`;
    });

    discordClient.subscribe("ACTIVITY_JOIN_REQUEST", ({ user }) => {
        var { id, username, discriminator, avatar } = user;
        window.confirm(`${username}#${discriminator} wants to join your game!`) ?
            () => {
                discordClient.request("SEND_ACTIVITY_JOIN_INVITE", { user_id: id });
            } :
            () => {
                discordClient.request("CLOSE_ACTIVITY_REQUEST", { user_id: id });
            };
    });*/

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
var id = null;

function updateDiscord() {
    if (typeof window.getGameActivity === 'function') {
        gameActivity = window.getGameActivity();
        gameMode = gameActivity.mode;
        mapName = gameActivity.map;
        className = gameActivity.class.name;
        timeLeft = gameActivity.time;
        id = gameActivity.id;

        if (gameMode == undefined || mapName == undefined || className == undefined) { return console.log("Not Loaded") } else {
            discordClient.setActivity({
                details: `Playing ${gameMode}`,
                state: `on ${mapName}`,
                endTimestamp: Date.now() + time * 1000,
                largeImageKey: "zeno_menu",
                largeImageText: "Zeno Client",
                smallImageKey: `class_${className.toLowerCase()}`,
                smallImageText: className,
                partyId: id,
                joinSecret: encrypt(id),
            });
        }
    }
}

var encrypt = (str) => {
    encrypter(str, 12)
}
var decrypt = (str) => {
    encrypter(str, -12)
}

var encrypter = function(str, amount) {
    if (amount < 0) {
        return caesarShift(str, amount + 26);
    }
    var output = "";
    for (var i = 0; i < str.length; i++) {
        var c = str[i];
        if (c.match(/[a-z]/i)) {
            var code = str.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
            } else if (code >= 97 && code <= 122) {
                c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
            }
        }
        output += c;
    }
    return output;
};

exports.initDiscord = initDiscord;