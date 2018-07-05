#!/usr/bin/node
const https          = require('https');
const fs             = require('fs');
const express        = require('express');
const bodyParser     = require('body-parser');
const line           = require('@line/bot-sdk');
const admin          = require('firebase-admin');
const app            = express();

const port           = 8080;
const lineConfig     = require('./keys/lineKey.json');
const ssl_options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/privkey.pem')
};

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// Initialize Firestore & Line Client
const db = admin.firestore();
const client = new line.Client(lineConfig);

// Parsing and Listening on Routes
app.use('/line_webhook', line.middleware(lineConfig));
app.use(bodyParser.json());

https.createServer(ssl_options, app).listen(port, () => {
  console.log('We are live on ' + port);
});

require('./routes')(app, db, client);
