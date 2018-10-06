const milight = require("node-milight-promise");

const lightTypes = {};
const zones = {};
const zoneNames = [];

function initialize(bridge_ip, bridge_version, zone_config) {
    const bridge = new milight.MilightController({ ip: bridge_ip, type: bridge_version });
    const commands = [];
    zone_config.forEach(function(zn) {
        const light = lightTypes[zn.type](bridge, zn.zone, zn.name, zn.hueOffset);
        zones[zn.name] = light;
        zoneNames.push(zn.name);
        commands.push(light.commands.off(light.zone));
    });
    bridge.ready().then(function() {
        bridge.sendCommands(commands);
    });
}

function bridgeName(bridge) {
    return bridge.type + "@" + bridge.ip + ":" + bridge.port;
}

function checkBounds(min, max, name) {
    return function(x) {
        if (typeof(x) === "number" && x >= min && x <= max) {
            return x;
        }
        throw Error(`expected a number between ${min} and ${max} in field ${name}`)
    };
}

function getValue(updated, existing, fallback) {
    if (updated !== undefined) { return updated; }
    else if (existing !== undefined) { return existing; }
    else { return fallback; }
}

function RGBCCTBase(bridge, zone, name, hueOffset) {
    this.name = name;
    this.bridge = bridge;
    this.zone = zone;
    this.hueOffset = hueOffset || 0;
    this.protocol = null;
    this.commands = null;
    this.mode = "off";
    this.state = {}
}

RGBCCTBase.prototype.flatten = function() {
    return {
        name: this.name,
        bridge: bridgeName(this.bridge),
        protocol: this.protocol,
        zone: this.zone,
        hueOffset: this.hueOffset,
        mode: this.mode,
        state: this.state,
    }
};

RGBCCTBase.prototype.adjustHue = function(hue) {
    return (hue + this.hueOffset) % 256;
};

RGBCCTBase.prototype.checkHue = checkBounds(0, 255, "state.hue");
RGBCCTBase.prototype.checkBrightness = checkBounds(0, 100, "state.brightness");
RGBCCTBase.prototype.checkSaturation = checkBounds(0, 100, "state.saturation");
RGBCCTBase.prototype.checkTemperature = checkBounds(0, 100, "state.temperature");
RGBCCTBase.prototype.checkEffectMode = checkBounds(1, 9, "state.effectMode");

RGBCCTBase.prototype.mergeState = function(mode, state) {
    if (mode === "off" || mode === "night") {
        return {}
    } else if (mode === "color") {
        let hue = 0;
        if (state.hue !== undefined) {
            hue = this.adjustHue(this.checkHue(state.hue));
        } else if (this.state.hue !== undefined) {
            hue = this.state.hue
        } else {
            hue = this.adjustHue(0);
        }
        return {
            hue: hue,
            brightness: this.checkBrightness(getValue(state.brightness, this.state.brightness, 0)),
            saturation: this.checkSaturation(getValue(state.saturation, this.state.saturation, 0))
        }
    } else if (mode === "white") {
        return {
            temperature: this.checkTemperature(getValue(state.temperature, this.state.temperature, 0)),
            brightness: this.checkBrightness(getValue(state.brightness, this.state.brightness, 0))
        }
    } else if (mode === "effect") {
        return {
            effectMode: this.checkEffectMode(getValue(state.effectMode, this.state.effectMode, 1)),
            brightness: this.checkBrightness(getValue(state.brightness, this.state.brightness, 0)),
            saturation: this.checkSaturation(getValue(state.saturation, this.state.saturation, 0))
        }
    }
    else {
        throw new Error(`expected mode to be one of off, night, color, white or effect`);
    }
};

RGBCCTBase.prototype.update = function(mode, state) {
    mode = mode || this.mode;
    state = state || {};
    state = this.mergeState(mode, state);

    const commands = [];

    // Mode commands
    if (mode !=="off" && this.mode === "off") {
        commands.push(this.commands.on(this.zone));
    }
    if (mode === "night" && this.mode !== "night") {
        commands.push(this.commands.nightMode(this.zone));
    } else if (mode === "color" && (this.mode !== "color" || state.hue !== this.state.hue)) {
        commands.push(this.commands.hue(this.zone, state.hue))
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

    // Send commands
    if (commands.length > 0) {
        this.bridge.sendCommands(commands);
    }

    // Update object state
    this.mode = mode;
    this.state = state;
};

lightTypes.RGBCCT8 = function(bridge, zone, name, hueOffset) {
    const light = new RGBCCTBase(bridge, zone, name, hueOffset);
    light.commands = milight.commandsV6.fullColor8Zone;
    light.protocol = "commandsV6.fullColor8Zone";
    return light;
};

lightTypes.RGBCCT4 = function(bridge, zone, name, hueOffset) {
    const light = new RGBCCTBase(bridge, zone, name, hueOffset);
    light.commands = milight.commandsV6.fullColor;
    light.protocol = "commandsV6.fullColor";
    return light;
};

module.exports = {
    "initialize": initialize,
    "lightTypes": lightTypes,
    "zones": zones,
    "zoneNames": zoneNames
};