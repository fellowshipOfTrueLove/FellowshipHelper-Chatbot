// server.js

const https          = require('https');
const fs             = require('fs');
const express        = require('express');
const bodyParser     = require('body-parser');
const middleware     = require('@line/bot-sdk').middleware
const app            = express();

const config = {
  channelAccessToken: 'mxhQqQAMYIIzo1yR2m7tjce0DYxGguwKieeQJaCzIOuuRfEpzZu4pP9OtKUI1VWyH7TtRn4Y3NJv1lPMgVnaN/Gu1MAtO6CWICRTEBy9eEvY9sgCfcFyaY8+nGhFSpK0KBz2jcZDOyBLFr/bYNM1DQdB04t89/1O/w1cDnyilFU=',
  channelSecret: '74a235a0c3126752b3087996443f6d26'
}

const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/fellowshipoflove.club/privkey.pem')
};

const port = 8080;



app.use('/line_webhook', middleware(config))
app.use(bodyParser.json())

https.createServer(options, app).listen(port, () => {
  console.log('We are live on ' + port);
});

app.post('/webhook', (req, res) => {
  console.log(req.body)
  res.send("Hello")
})

app.post('/line_webhook', (req, res) => {
  res.json(req.body.events) // req.body will be webhook event object
  res.send("Hello")
})
