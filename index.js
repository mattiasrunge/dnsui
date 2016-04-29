"use strict";

const mfw = require("mfw");

mfw({
    name: "dnsui",
    port: 3001,
    api: require("./lib/http-api"),
    routes: require("./lib/http-routes"),
    client: __dirname + "/client"
}).start();
