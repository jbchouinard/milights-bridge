var ip = require("ip");
var express = require('express');
var bodyParser = require("body-parser");
var path = require('path');
var lights = require('./lights');
var config = require('./config');


// Set up lights
var Milight = require('node-milight-promise').MilightController;
var bridge = new Milight({
    ip: config.bridge_ip, //"255.255.255.255",
    type: config.bridge_version
});

var zones = {};
var zoneNames = [];
config.zones.forEach(function(zn) {
    zones[zn.name] =  new lights[zn.type](bridge, zn.zone, zn.name, zn.hueOffset);
    zoneNames.push(zn.name);
});


// Set up app
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var http = require('http').Server(app);


// Views
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.render('index.html');
});

app.get('/api', function(req, res) {
	res.render('index.html');
});


function handleError(err) {
    console.log(err.stack);
}


// API
app.get('/api/zones', function(req, res) {
   res.json({
       status: 'ok',
       data: zoneNames.map(function(zn) {
           obj = zones[zn].flatten();
           obj.link = config.server_url + '/api/zones/' + obj.name;
           return obj;
       })
   })
});

app.put('/api/zones', function(req, res) {
    try {
        zoneNames.forEach(function(zn) {
            zones[zn].update(req.body.mode, req.body.state);
        });
        res.json({
            status: 'ok',
            data: zoneNames.map(function(zn) {
                obj = zones[zn].flatten();
                obj.link = config.server_url + '/api/zones/' + obj.name;
                return obj;
            })
        });
    } catch(err) {
        handleError(err);
        res.status(500);
        res.json({
            'status': 'error',
            'message': 'server error'
        });
    }
});

app.get('/api/zones/:zone', function(req, res) {
    if (req.params.zone in zones) {
        obj = zones[req.params.zone].flatten();
        obj.link = config.server_url + '/api/zones/' + obj.name;
        res.json({
            status: 'ok',
            data: obj
        })
    } else {
        res.status(404);
        res.json({
            status: 'error',
            message: 'zone does not exist'
        })
    }
});

app.put('/api/zones/:zone', function(req, res) {
    if (req.params.zone in zones) {
        zone = zones[req.params.zone];
        try {
            zone.update(req.body.mode, req.body.state);
            res.json({
                'status': 'ok',
                'data': zones[req.params.zone].flatten()
            })
        } catch(err) {
            handleError(err);
            res.status(500);
            res.json({
                'status': 'error',
                'message': 'server error'
            });
        }
    } else {
        res.status(404);
        res.json({
            'status': 'error',
            'message': 'zone does not exist'
        })
    }
});


var static_dir = path.join(__dirname, 'bootstrap');
app.use('/bootstrap', express.static(static_dir));
static_dir = path.join(__dirname, 'js');
http.listen(config.nodejs_port, function() {
	console.log('milights-rest started, check API docs at http://' + ip.address() + ':' + config.nodejs_port);
});
