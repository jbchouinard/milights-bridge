"use strict";
const express = require("express");
const createError = require("http-errors");
const errorHandler = require("api-error-handler");

const config = require("../config");
const lights = require("../models/lights");

lights.initialize(config.bridge_ip, config.bridge_version, config.zones);

const router = express.Router({});

function serialize(zone) {
    const serialized = zone.flatten();
    serialized.link = config.server_url + "/zones/" + zone.name;
    return serialized;
}

router.route("")
    .get(function(req, res) {
        res.json({
            status: 200,
            data: Array.from(lights.zones.values()).map(serialize)
        });
    })
    .put(function(req, res, next) {
        try {
            for (let zone of lights.zones.values()) {
                zone.update(req.body.mode, req.body.state);
            }
        } catch(err) {
            if (err instanceof lights.StateError) {
                return next(createError(400, err.message));
            } else {
                throw e;
            }
        }
        res.json({
            status: 200,
            data: Array.from(lights.zones.values()).map(serialize)
        });
    });

router.route("/:zone")
    .get(function(req, res, next) {
        if (lights.zones.has(req.params.zone)) {
            res.json({
                status: 200,
                data: serialize(lights.zones.get(req.params.zone))
            });
        } else {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
    })
    .put(function(req, res, next) {
        if (lights.zones.has(req.params.zone)) {
            let zone = lights.zones.get(req.params.zone);
            try {
                zone.update(req.body.mode, req.body.state);
            } catch (err) {
                if (err instanceof lights.StateError) {
                    return next(createError(400, err.message));
                } else {
                    throw err;
                }
            }
            res.json({
                status: 200,
                data: serialize(zone)
            });
        } else {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
    });

router.use(errorHandler());

module.exports = router;