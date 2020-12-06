module.exports.scopeTemp = [
    "https://assets.krunker.io/pro_scope.png?build=7FIag",
    "https://assets.krunker.io/pro_ads.png?build=7FIag",
    "https://cdn.discordapp.com/attachments/747410238944051271/751464889205391470/scope3444_9.png",
    "https://cdn.discordapp.com/attachments/747410238944051271/751465128486240407/Jedi_scope_fixed.png",
    "https://cdn.discordapp.com/attachments/747410238944051271/751465296677699634/bluescope.png",
    "https://cdn.discordapp.com/attachments/747410238944051271/751465743744499792/20200524_135724.png",
];

module.exports.getPluginDIR = (remote) => {
    return remote.app.getPath("documents") + "/ZenoPlugins";
}

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