"use strict";
const express = require("express");
const bodyParser = require("body-parser");

const zones = require("./controllers/zones");
const sched = require("./controllers/sched");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/zones", zones);
app.use("/api/sched", sched);

module.exports = app;
