const consts = require('../consts.js')

module.exports.initMute = () => {
    window.muteList = [];

    new MutationObserver((mutations, observer) => {
        if (document.body && consts.getID("windowHeader") && consts.getID("chatList")) {
            observer.disconnect();

            window.mute = (a, b) =>
                window.muteList.includes(a) ?
                ((window.muteList = window.muteList.filter((b) => b !== a)),
                    (b.innerText = "Mute")) :
                (window.muteList.push(a), (b.innerText = "Unmute"));
            window.playerlistHandler = () => {
                if ("Player List" == consts.getID("windowHeader").innerText) {
                    for (const a of[...consts.getID("menuWindow").children[1].children]) {
                        let b = [...a.children[0].children].filter(
                                (a) => "A" == a.nodeName
                            ),
                            c = b[0] ? b[0].href.split("&q=")[1].trim() : null;
                        null !== c &&
                            a.insertAdjacentHTML(
                                "beforeend",
                                `<span style="float:right"><span onmouseenter="playTick()" class="punishButton vote" onclick="mute('${c}', this)">${
                      window.muteList.includes(c) ? "Unmute" : "Mute"
                    }</span></span>`
                            );
                    }
                }
            };
            window.chatHandler = (a) => {
                if (
                    0 < a[0].addedNodes.length &&
                    0 == a[0].removedNodes.length &&
                    a[0].addedNodes[0].innerText.includes(":")
                ) {
                    let b
                    if (a[0].addedNodes[0].innerHTML !== undefined) {
                        b = a[0].addedNodes[0].innerHTML
                            .split(`"chatItem">‎`)[1]
                            .split(`‎: <span`)[0]
                            .trim();
                    }
                    window.muteList.includes(b) && a[0].addedNodes[0].remove();
                }
            };
            window.playerlistObserver = new MutationObserver(() =>
                window.playerlistHandler()
            ).observe(consts.getID("windowHeader"), {
                attributes: !0,
                subtree: !0,
                childList: !0,
            });
            window.chatObserver = new MutationObserver((a) =>
                window.chatHandler(a)
            ).observe(consts.getID("chatList"), {
                childList: !0,
            });
        }
    }).observe(document, {
        chatList: true,
        subtree: true,
        attributes: true,
    });
}