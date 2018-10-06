# milights-rest

milights-rest provides a RESTful API to control milight bulbs.

## Features

Only v6 protocol full color bulbs (4 zones and 8 zones) are implemented for now.

## Requirements
NodeJS and NPM. 

## Installation

### Install App
```bash
git clone https://github.com/jbchouinard/milights-rest.git
cd milights-rest
npm install
cp config.example.js config.js
# Edit config.js
```

### Generate API docs
```bash
# Edit "host" in swagger.json
npm install -g pretty-swag
pretty-swag -c pretty-swag.json
```

## Running

### As normal process

```bash
node server.js
```

###  As a service
```bash
npm install -g forever
forever start server.js
forever stop server.js
```

## License

[CC BY-NC-SA 3.0](https://creativecommons.org/licenses/by-nc-sa/3.0/)

**milights-rest**  &copy; Jerome Boisvert-Chouinard 2018.

Derived from **milights-bridge** &copy; [Kevin Van Ryckegem](http://signaware.com) 2017. All Rights Reserved.
