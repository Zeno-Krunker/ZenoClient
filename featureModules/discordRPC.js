const {discordClientID: clientID, getGame} = require('../consts.js');
const RPC = require("discord-rpc");
const discordClient = new RPC.Client({ transport: "ipc" });
const Store = require("electron-store");
const { ZenoEmitter, ZenoEvents } = require('../events.js');
const store = new Store();

let defaultActivity;

function initDiscord() {
    discordClient.login({ clientId: clientID })

    discordClient.on("ready", async () => {

        if(!store.get("DiscordID")) {
            store.set("DiscordID", discordClient.user.id);
        };

        await fetch("https://zenokrunkerapi.web.app/discordBadgeData.json")
            .then((resp) => resp.json())
            .then((data) => { window.zenoBadges = data[store.get("DiscordID")].badges; })
            .catch(error => console.error(error));

        defaultActivity = {
            details: `${discordClient.user.username}`,
            state: "Idle",
            largeImageKey: "zeno_menu",
            largeImageText: "Zeno Client",
            smallImageKey: window.zenoBadges ? `badge_${window.zenoBadges[0]}` : "zeno-icon",
            smallImageText: `${discordClient.user.username}#${discordClient.user.discriminator}`,
        }

        discordClient.setActivity(defaultActivity);

        discordClient.subscribe("ACTIVITY_JOIN", (para) => {
            window.location.href = `https://krunker.io/?game=${para.activity.party.id}`;
        });

        ZenoEmitter.on(ZenoEvents.GAME_ACTIVITY_LOADED, () => { setInterval(updateDiscord, 2000); });
    });
}

async function updateDiscord() {
    try {
        let gameActivity = window.getGameActivity();
        let { mode, map, time, user, id } = gameActivity;
        let className = gameActivity.class.name.replace(/ /g, "");

        let playerCount, playerMax;
        await fetch(getGame(id))
            .then(res => res.json())
            .then(json => {
                playerCount = json[2];
                playerMax = json[3];
            })
            .catch(console.log);


        discordClient.setActivity({
            details: `Playing ${mode}`,
            state: `on ${map}`,
            endTimestamp: (time === 0) ? undefined : Date.now() + time * 1000,
            largeImageKey: "zeno_menu",
            largeImageText: "Zeno Client",
            smallImageKey: `class_${className.toLowerCase()}`,
            smallImageText: user,
            partyId: id,
            matchSecret: id + '-match',
            joinSecret: store.get("AskToJoin") ? id + "-join" : undefined,
            partyMax: playerMax,
            partySize: playerCount,
        });
    } catch (err) { 
        discordClient.setActivity(defaultActivity);
        console.error(err); 
    }
}

exports.initDiscord = initDiscord;
exports.DiscordClient = discordClient;
