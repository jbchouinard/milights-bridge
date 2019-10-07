var lightMode = "white";
var whiteState = {
    brightness: 50,
    temperature: 0,
};
var colorState = {
    brightness: 50,
    saturation: 50,
    hue: 25,
};

function setMode(mode) {
    lightMode = mode;
    var colorDiv = document.getElementById("colorOptions");
    var whiteDiv = document.getElementById("whiteOptions");
    var brightDiv = document.getElementById("brightOptions");
    if (mode === "white") {
        colorDiv.style.display = "none";
        whiteDiv.style.display = "block";
        brightDiv.style.display = "block";
    } else if (mode === "color") {
        colorDiv.style.display = "block";
        whiteDiv.style.display = "none";
        brightDiv.style.display = "block";
    } else {
        colorDiv.style.display = "none";
        whiteDiv.style.display = "none";
        brightDiv.style.display = "none";
    }
}

function updateBrightness(value) {
    whiteState.brightness = +value;
    colorState.brightness = +value;
}

function updateTemperature(value) {
    whiteState.temperature = +value;
}

function updateHue(value) {
    colorState.hue = +value;
}

function updateSaturation(value) {
    colorState.saturation = (100 - value);
}

const pushState = async () => {
    let state;
    if (lightMode === "white") {
        state = whiteState;
    } else if (lightMode === "color") {
        state = colorState;
    } else {
        state = {};
    }
    const response = await fetch("/api/zones", {
        method: 'PUT',
        body: JSON.stringify({mode: lightMode, state: state}),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(response);
    const parsed = await response.json();
    console.log(parsed);
};

const pause = async (method) => {
    const response = await fetch("/api/sched/pause", {
        method: method
    });
    console.log(response);
};