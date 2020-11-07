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

module.exports.badges = ["verified", "content-creators", "dev", "vip", "gfx", "booster", "yendis-staff"];

module.exports.badgeUrls = {
    verified: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756190756984586381/Zeno_Verified.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748572694705864896/badge-verified.png",
    },
    "content-creators": {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756326228390182952/Zeno_CC.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748574740830093473/badge-cc.png",
    },
    dev: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756322128168747168/Zeno_Dev.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748573364968226887/badge-dev.png",
    },
    vip: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756343842764226670/Zeno_VIP.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748572846845984868/badge-crown.png",
    },
    gfx: {
        "url": "https://cdn.discordapp.com/attachments/756142725262213180/756193773515702312/Zeno_GFX.png",
        "url-old": "https://cdn.discordapp.com/attachments/747410238944051271/748576637225795614/badge-gfx.png",
    },
    booster: {
        "url": "https://media.discordapp.net/attachments/756142725262213180/756341309425451100/Zeno_Booster.png",
    },
    "yendis-staff": {
        "url": "https://media.discordapp.net/attachments/756142725262213180/756335806901125130/Zeno_YS.png"
    }
};

module.exports.badgeData = "https://zenokrunkerapi.web.app/badgeData.json";

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