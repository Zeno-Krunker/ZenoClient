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
    remote.app.getPath("documents") + "/ZenoSwapper/";
}