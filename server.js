// server.js

const express        = require('express');
const bodyParser     = require('body-parser');
const middleware = require('@line/bot-sdk').middleware
const app            = express();

const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
}
const port = 8080;

app.use('/line_webhook', middleware(config))
// app.use(bodyParser.json())

app.listen(port, () => {
  console.log('We are live on ' + port);
});

app.post('/line_webhook', (req, res) => {
  res.json(req.body.events) // req.body will be webhook event object
  res.send("Hello")
})
