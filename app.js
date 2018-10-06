const express = require("express");
const bodyParser = require("body-parser");

const zones = require("./controllers/zones");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/zones", zones);

module.exports = app;
