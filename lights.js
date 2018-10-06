var commandsV6 = require('node-milight-promise').commandsV6;

module.exports = {
    'RGBCCT8': RGBCCT8,
    'RGBCCT4': RGBCCT4
};

function bridgeName(bridge) {
    return bridge.type + '@' + bridge.ip + ':' + bridge.port;
}

function bounds(min, max) {
    return function(x) {
        return Math.min(max, Math.max(min, x));
    };
}

const pctBound = bounds(0, 100);
const hueBound = bounds(0, 255);
const effectModeBound = bounds(1, 9);

function RGBCCTBase(bridge, zone, name, hueOffset) {
    var self = this;
    this.name = name;
    this.bridge = bridge;
    this.zone = zone;
    this.hueOffset = hueOffset || 0;
    this.protocol = null;
    this.commands = null;
    this.mode = 'off';
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
        state: this.state
    }
};

RGBCCTBase.prototype.adjustHue = function(hue) {
    return (hue + this.hueOffset) % 256;
};

RGBCCTBase.prototype.mergeState = function(mode, state) {
    if (mode === "off" || mode === "night") {
        return {}
    } else if (mode === "color") {
        let hue = 0;
        if (state.hue !== undefined) {
            hue = this.adjustHue(state.hue);
        } else if (this.state.hue !== undefined) {
            hue = this.state.hue
        } else {
            hue = this.adjustHue(0);
        }
        return {
            hue: hue,
            brightness: pctBound(state.brightness || this.state.brightness || 0),
            saturation: pctBound(state.saturation || this.state.saturation || 0)
        }
    } else if (mode === "white") {
        return {
            temperature: pctBound(state.temperature || this.state.temperature || 0),
            brightness: pctBound(state.brightness || this.state.brightness || 0)
        }
    } else if (mode === "effect") {
        return {
            effectMode: effectModeBound(state.effectMode || this.state.effectMode || 1),
            brightness: pctBound(state.brightness || this.state.brightness || 0),
            saturation: pctBound(state.saturation || this.state.saturation || 0)
        }
    }
};

RGBCCTBase.prototype.update = function(mode, state) {
    let commands = [];
    mode = mode || this.mode;
    state = this.mergeState(mode, state);
    if (this.mode === "off" && mode !== "off") {
        console.log(`turn ${this.name} on`);
        commands.push(this.commands.on(this.zone));
    }
    if (mode === "off") {
        if (this.mode !== "off") {
            console.log(`turn ${this.name} off`);
            commands.push(this.commands.off(this.zone));
        }
    } else if (mode === "night") {
        if (this.mode !== "night") {
            console.log(`set ${this.name} to night mode`);
            commands.push(this.commands.nightMode(this.zone));
        }
    } else if (mode === "color") {
        if (this.mode !== "color" || state.hue !== this.state.hue) {
            console.log(`set ${this.name} hue to ${state.hue}`);
            commands.push(this.commands.hue(this.zone, state.hue))
        }
        if (this.state.saturation !== state.saturation) {
            console.log(`set ${this.name} saturation to ${state.saturation}`);
            commands.push(this.commands.saturation(this.zone, state.saturation))
        }
        if (this.state.brightness !== state.brightness) {
            console.log(`set ${this.name} brightness to ${state.brightness}`);
            commands.push(this.commands.brightness(this.zone, state.brightness))
        }
    } else if (mode === "white") {
        if (this.mode !== "white") {
            console.log(`set ${this.name} to white mode`);
            commands.push(this.commands.whiteMode(this.zone));
        }
        if (this.state.temperature !== state.temperature) {
            console.log(`set ${this.name} temperature to ${state.temperature}`);
            commands.push(this.commands.temperature(this.zone, state.temperature))
        }
        if (this.state.brightness !== state.brightness) {
            console.log(`set ${this.name} brightness to ${state.brightness}`);
            commands.push(this.commands.brightness(this.zone, state.brightness))
        }
    } else if (mode === "effect") {
        if (this.mode !== "effect" || this.state.effectMode !== state.effectMode) {
            console.log(`set ${this.name} effect mode to ${state.effectMode}`);
            commands.push(this.commands.effectMode(this.zone, state.effectMode));
        }
        if (this.state.saturation !== state.saturation) {
            console.log(`set ${this.name} saturation to ${state.saturation}`);
            commands.push(this.commands.saturation(this.zone, state.saturation))
        }
        if (this.state.brightness !== state.brightness) {
            console.log(`set ${this.name} brightness to ${state.brightness}`);
            commands.push(this.commands.brightness(this.zone, state.brightness))
        }
    }
    if (commands.length > 0) {
        console.log("sending commands");
        this.bridge.sendCommands(commands);
    }
    this.mode = mode;
    this.state = state;
};

function RGBCCT8() {
    RGBCCT8.super_.apply(this, arguments);
    this.commands = commandsV6.fullColor8Zone;
    this.protocol = 'commandsV6.fullColor8Zone';
}

RGBCCT8.super_ = RGBCCTBase;

RGBCCT8.prototype = Object.create(RGBCCTBase.prototype, {
   constructor: {
       value: RGBCCT8,
       enumerable: false
   }
});

function RGBCCT4() {
    RGBCCT4.super_.apply(this, arguments);
    this.commands = commandsV6.fullColor;
    this.protocol = 'commandsV6.fullColor';
}

RGBCCT4.super_ = RGBCCTBase;

RGBCCT4.prototype = Object.create(RGBCCTBase.prototype, {
    constructor: {
        value: RGBCCT4,
        enumerable: false
    }
});