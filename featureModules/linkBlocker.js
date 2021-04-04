module.exports = (store) => {
    window._openTab = window.openTab;
    window.openTab = (...args) => { if(!store.get("linkBlocker")) window._openTab(...args) };

    window._onTwitchClick = window.onTwitchClick;
    window.onTwitchClick = (...args) => { if(!store.get("linkBlocker")) window._onTwitchClick(...args) };
}