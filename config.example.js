var config = {};
// Change properties below this line

// The IP of your milights wifi bridge
// Set to 255.255.255.255 for automatic discovery
// If discovery does not work, set to manual IP
// Make sure that this IP is set as a static IP in your router settings
config.bridge_ip = "192.168.0.100";

// Version of your milights wifi bridge
// Options: "v4" (old square boxes) or "v6" (iBox with integrated light)
config.bridge_version = "v6";

// Port to run the web service at
config.nodejs_port = 3000;

// Set to proper external ip or host so links in the JSON objects work
config.server_url = "http://127.0.0.1:3000";

// Define zones and light types
// Light types:
//   RGBCCT8: 8-zone RGB CCT lights
//   RGBCCT4: 4-zone RGB CCT lights
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

// Do not change anything below this line
module.exports = config;
