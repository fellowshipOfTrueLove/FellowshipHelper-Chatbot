const { google } = require('googleapis');
const googleClient = require('../keys/googleClientKey.json');

const oauth2Client = new google.auth.OAuth2(
  googleClient.client_id,
  googleClient.client_secret,
  googleClient.redirect_uris
);

const SCOPES = ['https://www.googleapis.com/auth/forms',
  'https://www.googleapis.com/auth/script.external_request',
  'https://www.googleapis.com/auth/script.scriptapp'];

module.exports = function(app, db) {

  // visit the URL for this Function to obtain tokens
  app.get('/authGoogleAPI', (req, res) => {
    res.redirect(oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    }));
  });

  // after you grant access, you will be redirected to the URL for this Function
  // this Function stores the tokens to your Firebase database
  app.get('/OauthCallback', (req, res) => {
    console.log(JSON.stringify(req.query));
    const { code } = req.query;
    oauth2Client.getToken(code, (err, tokens) => {
      // Now tokens contains an access_token and an optional refresh_token. Save them.
      if (err) {
        console.log(JSON.stringify(err));
        return res.status(400).send(err);
      }

      return db.collection('biblebot').doc('api_tokens').set(tokens).then(() => res.status(200).send('OK'));
    });
  });

};
