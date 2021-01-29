const Store = require('electron-store');
const store = new Store();
const { getID } = require("../consts");

if (document.querySelector('div[onclick="showWindow(5)').innerHTML.toLowerCase().includes('login or register')) {
    if (!document.querySelector('body').innerHTML.includes(`document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div class="button" onclick="window.openAltManager(true)">Alt Manager</div>');`)) {
        document.querySelector('div[onclick="showWindow(5)').insertAdjacentHTML('afterend', '<div id="buttonA" class="button buttonP lgn" style="margin-left: 7px;padding-top: 3px;padding-bottom: 15px;" onclick="window.openAltManager(true)">Alt Manager</div>');
    }
}

window.openAltManager = (openNew) => {
    if (openNew) { showWindow(5) };
    let menuWindow = getID("menuWindow");
    menuWindow.innerHTML = "";

    var accounts = store.get("account");
    accounts.forEach((acc, i) => {
        let html = `<div class="settName zenoSetting"><span>${acc.name}</span><a class="+" style="background-color: #ec644b; color: white; margin-left: 10px;" onclick="window.removeAlt(${i})">Delete</a><a class="+" onclick="window.selectAlt(${i})">Login</a></div>`
        menuWindow.insertAdjacentHTML("beforeend", html);
    });
    menuWindow.insertAdjacentHTML("beforeend", `<center class="settName zenoSetting"><a class="+" onclick="window.addAlt()" style="float: none; padding-left: 30px; padding-right: 30px;">Add New Account</a></center>`);
};

window.selectAlt = (i) => {
    var account = store.get("account");
    showWindow(5);
    showWindow(5);
    getID("accName").value = account[i].name;
    getID("accPass").value = account[i].pass;
    loginAcc();
};

window.removeAlt = (i) => {
    var account = store.get("account");
    account.splice(i, 1);
    store.set("account", account);
    openAltManager();
};

window.addAlt = () => {
    var tempHTML = `<div class="setHed">Add Alt</div>
    <div class="settName" id="importSettings_div" style="display:block">Account Name <input type="url" placeholder="Account Name" name="url" class="inputGrey2" id="usernameAlt"></div>
    <div class="settName" id="importSettings_div" style="display:block">Account Password <input type="password" placeholder="Account Password" name="url" class="inputGrey2" id="passwordAlt"></div>
    <a class="+" id="addAltB">Add</a>
    </div>`;

    getID("menuWindow").innerHTML = tempHTML;
    getID("addAltB").addEventListener("click", () => {
        var account = store.get("account");
        var newAlt = {
            name: getID("usernameAlt").value,
            pass: getID("passwordAlt").value,
        };
        account.push(newAlt);
        store.set("account", account);
        window.openAltManager(false);
    });
};