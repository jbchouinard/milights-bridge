"use strict";
const http = require("http");

const app = require("./app");
const config = require("./config");

const server = new http.Server(app);
server.listen(config.nodejs_port, function() {
    console.log(`milights-rest started, check API docs at ${config.server_url}`);
});
