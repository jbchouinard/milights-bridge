const bodyParser = require("body-parser");
const express = require("express");

const lightsApi = require("./controllers/lights");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/api", lightsApi);

module.exports = app;
