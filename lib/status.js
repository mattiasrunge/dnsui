"use strict";

const fs = require("fs-promise");
const nmap = require("./nmap");
const dns = require("./dns");
const co = require("bluebird").coroutine;

let list = {};

module.exports = {
    setApi: function(api) {
        module.exports.api = api;
    },
    update: co(function*() {
        console.log("Updating status...");
        let nmapList = yield nmap.scan();
        let dnsList = yield dns.list();
        let obj = {};

        for (let nmapData of nmapList) {
            obj[nmapData.ip] = obj[nmapData.ip] || { ip: nmapData.ip };
            obj[nmapData.ip].services = nmapData.services;
            obj[nmapData.ip].online = true;
        }

        for (let dnsData of dnsList) {
            obj[dnsData.ip] = obj[dnsData.ip] || { ip: dnsData.ip };

            if (dnsData.type === "A") {
                obj[dnsData.ip].name = dnsData.name;
            } else {
                obj[dnsData.ip].aliases = obj[dnsData.ip].aliases || [];
                obj[dnsData.ip].aliases.push(obj[dnsData.ip].name);
            }
        }

        for (let ip of Object.keys(obj)) {
            obj[ip].online = obj[ip].online || false;
            obj[ip].services = obj[ip].services || [];
            obj[ip].name = obj[ip].name || false;
            obj[ip].aliases = obj[ip].aliases || [];


            if (JSON.stringify(list[ip]) !== JSON.stringify(obj[ip])) {
                list[ip] = obj[ip];

                this.api.emit("update", list[ip]);
            }
        }

        console.log("Status updated!");
    }),
    list: co(function*() {
        return Object.keys(list).map(ip => list[ip]);
    })
};

module.exports.update();

setInterval(function() {
    module.exports.update();
}, 10000);
