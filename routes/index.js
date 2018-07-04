const middleware     = require('@line/bot-sdk').middleware
const bodyParser     = require('body-parser');

const line_webhook   = require('./line_webhook');
const webhook        = require('./webhook');
const lineConfig     = require('../keys/lineKey.json');

module.exports = function(app, db) {

  app.use('/line_webhook', middleware(lineConfig))
  app.use(bodyParser.json())

  app.post('/line_webhook', (req, res) => {
    line_webhook({ app, db, req, res });
  });

  app.post('/webhook', (req, res) => {
    webhook({ app, db, req, res });
  });
  
  // Other route groups could go here, in the future

};
