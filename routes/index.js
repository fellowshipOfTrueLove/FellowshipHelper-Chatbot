const line           = require('@line/bot-sdk');
const bodyParser     = require('body-parser');

const line_webhook   = require('./line_webhook');
const webhook        = require('./webhook');
const lineConfig     = require('../keys/lineKey.json');

module.exports = function(app, db) {

  app.use('/line_webhook', line.middleware(lineConfig));
  app.use(bodyParser.json());

  const client = new line.Client(lineConfig);
  line_webhook(app, db, client);

  webhook(app, db);

  // Other route groups could go here, in the future

};
