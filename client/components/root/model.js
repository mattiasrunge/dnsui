"use strict";

define([
    "knockout",
    "mfw/socket",
    "mfw/status",
    "lib/bindings"
], function(ko, socket, status) {
    return function() {
        this.unsortedList = ko.observableArray(false);
        this.list = ko.pureComputed(function() {
            return this.unsortedList().sort(function(a, b) {
                return parseInt(a().ip.replace(/\./g, ""), 10) - parseInt(b().ip.replace(/\./g, ""), 10);
            });
        }.bind(this));
        this.status = status.create();

        this.status(true);
        socket.emit("list", {}, function(error, list) {
            this.status(false);

            if (error) {
                console.error(error);
                status.printError("Failed list devices, error: " + error);
                return;
            }

            console.log("Loaded", list);

            this.unsortedList(list.map(function(host) {
                return ko.observable(host);
            }));
        }.bind(this));

        var update = function(host) {
            console.log("Updated", host);

            var existing = this.unsortedList().filter(function(item) {
                return item().ip === host.ip;
            })[0];

            if (existing) {
                existing(host);
            } else {
                this.unsortedList.push(ko.observable(host));
            }
        }.bind(this);

        socket.on("update", update);

        this.dispose = function() {
            socket.off("update", update);
        };
    };
});
