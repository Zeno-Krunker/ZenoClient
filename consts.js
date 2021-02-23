module.exports.getResourceSwapper = (remote) => {
    return remote.app.getPath("documents") + "/ZenoSwapper/";
}

module.exports.discordClientID = "758353378547073055";

module.exports.getGame = (id) => {
    return `https://matchmaker.krunker.io/game-info?game=${id}`;
}

module.exports.gameLoaded = () => {
    try {
        window.getGameActivity();
        return true;
    } catch {
        return false;
    }
}

module.exports.getID = (id) => window.document.getElementById(id);

module.exports.getClass = (classname, index) => {
    if(index === undefined) return window.document.getElementsByClassName(classname);
    return window.document.getElementsByClassName(classname)[index];
};

module.exports.badgeUrls = new Map()
    .set("verified", "https://cdn.discordapp.com/attachments/756142725262213180/756190756984586381/Zeno_Verified.png")
    .set("content-creators", "https://cdn.discordapp.com/attachments/756142725262213180/756326228390182952/Zeno_CC.png")
    .set("dev", "https://cdn.discordapp.com/attachments/756142725262213180/756322128168747168/Zeno_Dev.png")
    .set("vip", "https://cdn.discordapp.com/attachments/756142725262213180/756343842764226670/Zeno_VIP.png")
    .set("gfx", "https://cdn.discordapp.com/attachments/756142725262213180/756193773515702312/Zeno_GFX.png")
    .set("booster", "https://cdn.discordapp.com/attachments/756142725262213180/756341309425451100/Zeno_Booster.png")
    .set("yendis-staff", "https://media.discordapp.net/attachments/756142725262213180/756335806901125130/Zeno_YS.png")
    .set("comp", "https://cdn.discordapp.com/attachments/756142725262213180/783365605041373214/badge_comp.png");

module.exports.tryModule = function (moduleName) {
    const module = require("./featureModules/" + moduleName);
    try { module() } catch (err) { console.log(err) };
}