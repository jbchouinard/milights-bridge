# milights-rest

milights-rest provides a RESTful API to control milight bulbs.

## Features

Only v6 protocol full color bulbs are implemented for now.

## Requirements
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

## Installation

- Clone the Git repository.
`git clone https://github.com/jbchouinard/milights-rest.git`
- Go into the *milights-bridge* directory.
`cd milights-rest`
- Install required libraries
`npm install`
- Copy the example configuration file.
`cp config.example.js config.js`
- Edit the configuration, follow the instructions inside the file.
`vi config.js`
or
`nano config.js`
- Now, it is possible to run *milights-rest*
`sudo node server.js`
- Open your browser at `http://localhost:<port>` (the port is configurable in config.js, default is *3000*).

## Running milights-bridge as a service
- Install *forever*
`sudo npm install -g forever`
- Run *milights-bridge* using *forever* (inside *milights-bridge* folder)
`forever start server.js`
- Stop *milights-bridge* (inside *milights-bridge* folder)
`forever stop server.js`


## License

Based on https://github.com/KevinVR/milights-bridge:

&copy; [Kevin Van Ryckegem](http://signaware.com) 2017. All Rights Reserved.
**Software License:** `Creative Commons Non-Commercial ShareAlike 3.0 unported`
For more information, visit: [CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)
