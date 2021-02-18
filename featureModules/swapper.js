const { mkdir, readdirSync, statSync } = require("fs");
const { format } = require("url");

exports.initSwapper = app => {
    let sf = `${app.getPath("documents")}/ZenoSwapper`;

    try {
        mkdir(sf, { recursive: true }, (e) => {});
    } catch (e) {}

    let s = { filter: { urls: [] }, files: {} };

    const afs = (dir, fileList = []) => {
        readdirSync(dir).forEach((file) => {
            var filePath;
            if (dir.endsWith("/")) {
                filePath = dir + file;
            } else {
                filePath = dir + "/" + file;
            }
            if (statSync(filePath).isDirectory()) {
                if (!/\\(docs)$/.test(filePath)) afs(filePath);
            } else {
                if (!/\.(html|js)/g.test(file)) {
                    let k;
                    if(/\.(mp3)/g.test(file)){
                        k = "*://krunker.io" + filePath.replace(sf, "").replace(/\\/g, "/") + "*";
                    } else {
                        k = "*://assets.krunker.io" + filePath.replace(sf, "").replace(/\\/g, "/") + "*";
                    }
                    s.filter.urls.push(k);
                    s.files[k.replace(/\*/g, "")] = format({
                        pathname: filePath,
                        protocol: "file:",
                        slashes: true,
                    });
                }
            }
        });
    };
    afs(sf);
    return s;
}

exports.attachSwapper = (window, s) => {
    if(!s?.filter.urls.length) return;
    window.webContents.session.webRequest.onBeforeRequest(s.filter, (details, callback) => {
        callback({
            cancel: false,
            redirectURL: s.files[details.url.replace(/https|http|(\?.*)|(#.*)/gi, "")] ||details.url,
        });
    });
}