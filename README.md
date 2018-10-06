# milights-rest

milights-rest provides a RESTful API to control milight bulbs.

## Features

Only v6 protocol full color bulbs (4 zones and 8 zones) are implemented for now.

## Requirements
```bash
sudo apt-get update
sudo apt-get install nodejs npm
```

## Installation

```bash
git clone https://github.com/jbchouinard/milights-rest.git
cd milights-rest
npm install
cp config.example.js config.js
# Edit config.js
node server.js
```

## Running as a service
```bash
sudo npm install -g forever
forever start server.js
forever stop server.js
```

## License

[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)

**milights-rest**  &copy; Jerome Boisvert-Chouinard 2018.

Derived from **milights-bridge** &copy; [Kevin Van Ryckegem](http://signaware.com) 2017. All Rights Reserved.
