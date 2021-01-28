const msgpack = require('msgpack-lite');

function parseData(data) {
    if (data instanceof DataView) {
        data = new Uint8Array(data.buffer);
    } else if (data instanceof ArrayBuffer) {
        data = new Uint8Array(data);
    } else {
        try {
            data = JSON.parse(data);
        } catch (err) {}
    }

    try {
        data = msgpack.decode(data);
    } catch (err) {}

    return data;
}

window.WebSocket = new Proxy(WebSocket, {
    construct(target, args) {
        var ws = window.wsHook = new target(...args);
        ws.addEventListener('message', function(message) {
            var data = message.data;

            data = parseData(data);
            
            if(data[0] == "a"){
                data.pop();
                window.playerData = data;
            }

            if(data[0] == "cln"){
                window.clanData = data[2];
            }
        });
        return ws;
    }
});