"use strict";
const milight = require("node-milight-promise");

const types = {};
class StateError extends Error {}

function initialize(bridge_ip, bridge_version, zone_config) {
    const bridge = new milight.MilightController({ ip: bridge_ip, type: bridge_version });
    const zones = zone_config.map(conf => new types[conf.type](bridge, conf.zone, conf.name, conf.hueOffset));
    return Promise.all(zones.map(zone => zone.initialize()));
}

function bridgeName(bridge) {
    return bridge.type + "@" + bridge.ip + ":" + bridge.port;
}

function checkBounds(min, max, name) {
    return function(x) {
        if (typeof x === "number" && x >= min && x <= max) {
            return x;
        }
        throw new StateError(`expected a number between ${min} and ${max} in field ${name}`)
    };
}

function getValue(updated, existing, fallback) {
    if (updated !== undefined) { return updated; }
    else if (existing !== undefined) { return existing; }
    else { return fallback; }
}

// Light models must implement the same public interface as this class
class RGBCCTBase {
    // (MilightController, integer, string, integer) => RGBCCTBase
    constructor(bridge, zone, name, hueOffset) {
        this.name = name;
        this.bridge = bridge;
        this.zone = zone;
        this.hueOffset = hueOffset || 0;
        this.protocol = undefined;
        this.commands = undefined;
        this.mode = undefined;
        this.state = {};
    }
    // () => Promise<RGBCCTBase>
    initialize() {
        return this.update('off', {}).then(()=>this);
    }
    // () => Object
    flatten() {
        return {
            name: this.name,
            bridge: bridgeName(this.bridge),
            protocol: this.protocol,
            zone: this.zone,
            hueOffset: this.hueOffset,
            mode: this.mode,
            state: this.state,
        }
    }
    // (string, Object) => Promise<undefined>
    update(mode, state) {
        mode = mode || this.mode;
        state = state || {};
        try {
            state = this._mergeState(mode, state);
        } catch(err) {
            return Promise.reject(err);
        }

        const commands = [];
        // Mode commands
        if (mode !=="off" && this.mode === "off") {
            commands.push(this.commands.on(this.zone));
        }
        if (mode === "night" && this.mode !== "night") {
            commands.push(this.commands.nightMode(this.zone));
        } else if (mode === "color" && (this.mode !== "color" || state.hue !== this.state.hue)) {
            commands.push(this.commands.hue(this.zone, this._adjustHue(state.hue)));
        } else if (mode === "white" && this.mode !== "white") {
            commands.push(this.commands.whiteMode(this.zone));
        } else if (mode === "effect" && (this.mode !== "effect" || this.state.effectMode !== state.effectMode)) {
            commands.push(this.commands.effectMode(this.zone, state.effectMode));
        } else if (mode === "off" && this.mode !== "off") {
            commands.push(this.commands.off(this.zone));
        }
        // Other commands
        if (this.state.brightness !== state.brightness) {
            commands.push(this.commands.brightness(this.zone, state.brightness))
        }
        if (this.state.saturation !== state.saturation) {
            commands.push(this.commands.saturation(this.zone, state.saturation))
        }
        if (this.state.temperature !== state.temperature) {
            commands.push(this.commands.whiteTemperature(this.zone, state.temperature))
        }

        // Send commands to bridge if any
        if (commands.length > 0) {
            return this.bridge.ready()
                .then(() => this.bridge.sendCommands(...commands))
                .then(() => { this.mode = mode; this.state = state; })
        }
        // Otherwise nothing to do, just resolve
        return Promise.resolve();

    }
    _adjustHue(hue) {
        return (hue + this.hueOffset) % 256;
    }
    // If an incomplete state is sent to update, fill it in with current values or defaults
    _mergeState(mode, state) {
        if (mode === "off" || mode === "night") {
            return {}
        } else if (mode === "color") {
            return {
                hue: this._checkHue(getValue(state.hue, this.state.hue, 0)),
                brightness: this._checkBrightness(getValue(state.brightness, this.state.brightness, 0)),
                saturation: this._checkSaturation(getValue(state.saturation, this.state.saturation, 0))
            }
        } else if (mode === "white") {
            return {
                temperature: this._checkTemperature(getValue(state.temperature, this.state.temperature, 0)),
                brightness: this._checkBrightness(getValue(state.brightness, this.state.brightness, 0))
            }
        } else if (mode === "effect") {
            return {
                effectMode: this._checkEffectMode(getValue(state.effectMode, this.state.effectMode, 1)),
                brightness: this._checkBrightness(getValue(state.brightness, this.state.brightness, 0)),
                saturation: this._checkSaturation(getValue(state.saturation, this.state.saturation, 0))
            }
        }
        else {
            throw new StateError("expected mode to be one of off, night, color, white or effect");
        }
    }
}
RGBCCTBase.prototype._checkHue = checkBounds(0, 255, "state.hue");
RGBCCTBase.prototype._checkBrightness = checkBounds(0, 100, "state.brightness");
RGBCCTBase.prototype._checkSaturation = checkBounds(0, 100, "state.saturation");
RGBCCTBase.prototype._checkTemperature = checkBounds(0, 100, "state.temperature");
RGBCCTBase.prototype._checkEffectMode = checkBounds(1, 9, "state.effectMode");

types.RGBCCT8 = class extends RGBCCTBase {
    constructor(bridge, zone, name, hueOffset) {
        super(bridge, zone, name, hueOffset);
        this.commands = milight.commandsV6.fullColor8Zone;
        this.protocol = "commandsV6.fullColor8Zone";

    }
};

types.RGBCCT4 = class extends RGBCCTBase {
    constructor(bridge, zone, name, hueOffset) {
        super(bridge, zone, name, hueOffset);
        this.commands = milight.commandsV6.fullColor;
        this.protocol = "commandsV6.fullColor";
    }
};

module.exports = {
    "initialize": initialize,
    "types": types,
    "StateError": StateError
};