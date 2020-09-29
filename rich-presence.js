// Discrod Rich Presence for Zeno Client
// By TheDevKeval - Keval#8167
// mf don't you dare remove this...

const RPC = require("discord-rpc");

const discordClient = new RPC.Client({
    transport: "ipc"
});

function initDiscord(mapInfo, menuClassName) {

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

    let discordObserver = new MutationObserver(updateDiscord);
    discordObserver.observe(mapInfo, {
        childList: true
    });
    discordObserver.observe(menuClassName, {
        childList: true
    });
}

const gameModeFull = {
    ffa: "Free For All",
    kc: "Kill Capture",
    tdm: "Team Deathmatch",
    ctf: "Capture The Flag",
    point: "Hardpoint",
    king: "King Of The Hill",
    gun: "Gun Game",
    shrp: "Sharp Shooter",
    stalk: "Stalker",
    boss: "Boss Hunt",
    bhop: "Parkour",
    hide: "Hide and Seek",
    infect: "Infected",
    race: "Race",
    lms: "Last Man Standing",
    simon: "Simon Says",
    prop: "Prop Hunt",
    oitc: "One in the Chamber",
    trade: "Trade",
    dif: "Diffuse",
    trai: "Traitor",
};

var gameMode = null;
var mapName = null;
var className = null;

function updateDiscord() {
    gameMode = mapInfo.innerHTML.split("_")[0];
    mapName = mapInfo.innerHTML.split("_")[1];
    className = menuClassName.innerHTML.split(" ").join("");

    if (gameMode == undefined || mapName == undefined || className == undefined)
        return console.log("Some Value is Undefined");

    discordClient.setActivity({
        details: `Playing ${gameModeFull[gameMode]}`,
        state: `in ${mapName}`,
        largeImageKey: "zeno_menu",
        largeImageText: "Zeno Client",
        smallImageKey: `class_${className.toLowerCase()}`,
        smallImageText: className,
    });
}

exports.initDiscord = initDiscord;