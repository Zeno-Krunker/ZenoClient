const tmi = require('tmi.js');

module.exports.initTwitch = (channelName) => {
    const client = new tmi.Client({
        connection: {
            secure: true,
            reconnect: true
        },
        channels: [channelName]
    });

    client.connect();

    client.on('message', (channel, tags, message, self) => {
        getID('chatList').insertAdjacentHTML('beforeend', `<div id="chatMsg_0"><div class="chatItem chatTextOutline twitch" style="background-color: rgba(0, 0, 0, 1)">&lrm;${tags['display-name']}&lrm;: <span class="chatMsg">&lrm;${message}&lrm;</span></div><br></div>`)
    });

}
var getID = (id) => document.getElementById(id);