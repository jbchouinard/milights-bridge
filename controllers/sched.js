"use strict";
const fs = require("fs");
const express = require("express");
const createError = require("http-errors");
const errorHandler = require("api-error-handler");

const config = require("../config");

const pauseFile = config.pause_file;

const router = express.Router({});

router.route("/pause")
    .put(function(req, res, next) {
        try {
            fs.openSync(pauseFile, 'w');
        } catch (err) {
            return next(createError(500, err.message));
        }
        res.json({'status': 200});
    })
    .delete(function(req, res, next) {
        try {
            if (fs.existsSync(pauseFile)) {
                fs.unlinkSync(pauseFile);
            }
        } catch (err) {
            return next(createError(500, err.message));
        }
        res.json({'status': 200});
    });

router.use(errorHandler());

module.exports = router;
