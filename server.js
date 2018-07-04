#!/usr/bin/node
const https          = require('https');
const fs             = require('fs');
const express        = require('express');
const app            = express();
const port           = 8080;

const ssl_options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/privkey.pem')
};


require('./routes')(app, {});

https.createServer(ssl_options, app).listen(port, () => {
  console.log('We are live on ' + port);
});
