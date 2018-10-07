"use strict";
const express = require("express");
const createError = require("http-errors");
const errorHandler = require("api-error-handler");

const config = require("../config");
const lights = require("../models/lights");

let zoneMap = new Map();
lights.initialize(config.bridge_ip, config.bridge_version, config.zones)
    .then(function(initializedZones) {
        for (let zone of initializedZones) {
            zoneMap.set(zone.name, zone);
        }
    });

function serialize(zone) {
    const serialized = zone.flatten();
    serialized.link = config.server_url + "/api/zones/" + zone.name;
    return serialized;
}

const router = express.Router({});

router.route("")
    .get(function(req, res) {
        res.json({
            status: 200,
            data: Array.from(zoneMap.values()).map(serialize)
        });
    })
    .put(function(req, res, next) {
        const zones = Array.from(zoneMap.values());
        Promise.all(zones.map(zone => zone.update(req.body.mode, req.body.state)))
            .then(() => res.json({status: 200, data: zones.map(serialize)}))
            .catch(function(err) {
                if (err instanceof lights.StateError) {
                    return next(createError(400, err.message));
                } else {
                    throw err;
                }
            });
    });

router.route("/:zone")
    .get(function(req, res, next) {
        if (!zoneMap.has(req.params.zone)) {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
        res.json({
            status: 200,
            data: serialize(zoneMap.get(req.params.zone))
        })
    })
    .put(function(req, res, next) {
        if (!zoneMap.has(req.params.zone)) {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
        let zone = zoneMap.get(req.params.zone);
        zone.update(req.body.mode, req.body.state)
            .then(() => res.json({status: 200, data: serialize(zone)}))
            .catch(function(err) {
                if (err instanceof lights.StateError) {
                    return next(createError(400, err.message));
                } else {
                    throw err;
                }
            });
    });

router.use(errorHandler());

module.exports = router;