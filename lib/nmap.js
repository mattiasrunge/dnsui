"use strict";

const Bluebird = require("bluebird");
const os = require("os");
const co = Bluebird.coroutine;
const exec = Bluebird.promisify(require("child_process").exec);
const xml2json = require("xml2json");

function ensureArray(data) {
    if (data === "") {
        return [];
    } else if (data instanceof Array) {
        return data;
    } else if (typeof data === "object") {
        return [ data ];
    }

    return [];
};

module.exports = {
    scan: co(function*() {
        let ifs = os.networkInterfaces();
        let name = Object.keys(ifs).filter(name => name !== "lo")[0];

        if (!name) {
            throw new Error("Could not find a valid network interface");
        }

        let ipv4 = ifs[name].filter(iface => iface.family === "IPv4")[0];

        if (!ipv4) {
            throw new Error("Found no IPv4 interface");
        }

        let range = ipv4.address.replace(/^([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/, "$1.$2.$3.*");
        let cmd = "nmap -e " + name + " -oX - " + range;
        console.log("Executing: " + cmd);
        let result = yield exec(cmd);

        let obj = xml2json.toJson(result.toString(), { object: true });

        let list = obj.nmaprun.host.filter(host => host.status.state !== "down");

        return list.map(host => {
            let names = ensureArray(host.hostnames).map(hostname => hostname.hostname.name);
            let services = ensureArray(host.ports.port).map(port => { return { port: port.portid, protocol: port.protocol, name: port.service.name } });

            return {
                ip: host.address.addr,
                names: names,
                services: services
            };
        });
    })
};
