#!/usr/bin/node
const express        = require('express');
const bodyParser     = require('body-parser');
const admin          = require('firebase-admin');
const app            = express();
const port           = 8080;

// Initialize Firebase
const firebaseServiceAccount = require("./keys/old_firebaseKey.json");
admin.initializeApp({
  credential: admin.credential.cert(firebaseServiceAccount),
  // databaseURL: "https://fellowship-helper.firebaseio.com"
  databaseURL: "https://biblebot-f4704.firebaseio.com"
});

// Initialize Firestore & Line Client
const db = admin.firestore();
const client = {
  replyMessage: (token, message) => {
    console.log("Response: " + JSON.stringify(message));

    return {
      catch: () => {}
    }
  }
};

// Parsing and Listening on Routes
app.use(bodyParser.json());

app.listen(port, () => {
  console.log('We are live on ' + port);
});

require('./routes')(app, db, client);
