"use strict";

const Bluebird = require("bluebird");
const fs = require("fs-promise");
const co = Bluebird.coroutine;

module.exports = {
    list: co(function*() {
        let zone = "loc";
        let db = yield fs.readFile("/etc/bind/db." + zone);

        return db
        .toString()
        .split("\n")
        .filter(line => line !== "" && line.search(/^[$|;| |\t|@|$]/) === -1)
        .map(line => {
//             console.log("\"" + line + "\"");
            let parts = line.replace(/\s+/g, " ").split(" ");
            return { name: parts[0] + "." + zone, type: parts[2], ip: parts[3] };
        });
    })
};
