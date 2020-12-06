// by hitthemoney#1337
const Store = require("electron-store");
const store = new Store();

module.exports = () => {
    if (store.get("SkyColorToggle")) {
        Object.defineProperty(Object.prototype, "skyCol", {
            value: store.get("SkyColor"),
            writable: false
        })
    }
}