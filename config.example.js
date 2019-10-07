const config = {};

// The IP of your milights wifi bridge
config.bridge_ip = "192.168.0.100";

// Version of your milights wifi bridge
// Options: "v4" (old square boxes) or "v6" (iBox with integrated light or iBox2 square box)
// node-milight-promise supports both but so far only v6 is tested with milights-rest
config.bridge_version = "v6";

// Port to run the web service at
config.nodejs_port = 3000;

// Set to proper external ip or host so links in the JSON objects work
// You might also want to change "host" in swagger.json to match this and generate
// or re-generate the docs so that the interactive examples in the Swagger
// docs work from anywhere
config.server_url = "http://127.0.0.1:3000";
config.pause_file = "/path/to/milights-driver/pause-file";

// Define zones and light types
// Settings:
//   name: name of the zone for access through
//   type: one of:
//     RGBCCT8: 8-zone RGB CCT lights
//     RGBCCT4: 4-zone RGB CCT lights
//        (node-milight-promise support other types, but these are the only ones I have available for testing
//         if you have other types and are willing to test feel free to open an issue)
//   zone: zone number - the lights have to be paired to a zone with the Milight bridge using the official app
//   hueOffset: normally hue = 0 should be red. I found some variation between products, if the light
//              is not quite red when setting hue=0 in the API, it can be adjusted with hueOffset
config.zones = [
    {
        name: 'office',
        zone: 0,
        type: 'RGBCCT8',
        hueOffset: 0
    },
    {
        name: 'dining',
        zone: 1,
        type: "RGBCCT4",
        hueOffset: 10,
    },
    {
        name: 'entrance',
        zone: 2,
        type: 'RGBCCT4',
        hueOffset: 10,
    }
];

module.exports = config;
