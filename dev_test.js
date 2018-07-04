#!/usr/bin/node
const express        = require('express');
const bodyParser     = require('body-parser');
const app            = express();
const port           = 8080;

app.use(bodyParser.json());
const line_webhook   = require('./routes/line_webhook');

app.listen(port, () => {
  console.log('We are live on ' + port);
});

line_webhook(app, {}, {
  replyMessage: (token, message) => {
    console.log("Response: " + JSON.stringify(message));

    return {
      catch: () => {}
    }
  }
});;
