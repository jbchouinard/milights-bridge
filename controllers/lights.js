const express = require("express");
const createError = require("http-errors");
const errorHandler = require("api-error-handler");

const config = require("../config");
const lights = require("../models/lights");

lights.initialize(config.bridge_ip, config.bridge_version, config.zones);

const router = express.Router({});

router.route("/zones")
    .get(function(req, res, next) {
        res.json({
            status: 200,
            data: lights.zoneNames.map(function(zn) {
                const zone = lights.zones[zn].flatten();
                zone.link = config.server_url + "/zones/" + zone.name;
                return zone;
            })
        });
    })
    .put(function(req, res, next) {
        lights.zoneNames.forEach(function(zn) {
            try {
                lights.zones[zn].update(req.body.mode, req.body.state);
            } catch (err) {
                return next(createError(400, err.message));
            }
        });
        res.json({
            status: 200,
            data: lights.zoneNames.map(function(zn) {
                const zone = lights.zones[zn].flatten();
                zone.link = config.server_url + "/zones/" + zone.name;
                return zone;
            })
        });
    });

router.route("/zones/:zone")
    .get(function(req, res, next) {
        if (req.params.zone in lights.zones) {
            const zone = lights.zones[req.params.zone].flatten();
            zone.link = config.server_url + "/zones/" + zone.name;
            res.json({
                status: 200,
                data: zone
            });
        } else {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
    })
    .put(function(req, res, next) {
        if (req.params.zone in lights.zones) {
            let zone = lights.zones[req.params.zone];
            try {
                zone.update(req.body.mode, req.body.state);
            } catch (err) {
                return next(createError(400, err.message));
            }
            zone = zone.flatten();
            zone.link = config.server_url + "/zones/" + zone.name;
            res.json({
                status: 200,
                data: zone
            });
        } else {
            return next(createError(404, `zone ${req.params.zone} does not exist`));
        }
    });

router.use(errorHandler());

module.exports = router;