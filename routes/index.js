const line_webhook   = require('./line_webhook');
const webhook        = require('./webhook');

module.exports = function(app, db, client) {

  line_webhook(app, db, client);
  webhook(app, db, client);

  // Other route groups could go here, in the future

};
