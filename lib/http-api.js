"use strict";

const status = require("./status");

module.exports = {
    "list": function*(data) {
        return yield status.list();
    }
};

status.setApi(module.exports);
