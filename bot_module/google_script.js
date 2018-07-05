const { google } = require('googleapis');
const googleClient = require('../keys/googleClientKey.json');
const script = google.script('v1');

function scriptFunction(db, scriptId, functionName, functionParameters) {
  let params = functionParameters;
  if (!Array.isArray(params)) {
    params = [functionParameters];
  }
  console.log(`Script Function - ${functionName} : ${params}`);
  return authorize(db).then(auth => callAppsScript(auth, {
    auth,
    scriptId,
    resource: {
      function: functionName,
      parameters: params,
      devMode: false,
    },
  })).catch((error) => {
    console.log(error);
  });
}

const oauth2Client = new google.auth.OAuth2(
  googleClient.client_id,
  googleClient.client_secret,
  googleClient.redirect_uris
);

let oauthTokens = null;

function authorize(db) {
  // Check if we have previously stored a token.
  return new Promise((resolve, reject) => {
    if (!oauthTokens) {
      return db.collection('biblebot').doc('api_tokens').get()
        .then((snapshot) => {
          oauthTokens = snapshot.data();
          oauth2Client.setCredentials(oauthTokens);
          return resolve(oauth2Client);
        })
        .catch(() => reject());
    }
    return resolve(oauth2Client);
  });
}

function callAppsScript(auth, setting) {
  // Make the API request. The request object is included here as 'resource'.
  return script.scripts.run(setting, (err, resp) => {
    if (err) {
      // The API encountered a problem before the script started executing.
      console.log(`The API returned an error: ${err}`);
      return;
    }
    if (resp.error) {
      // The API executed, but the script returned an error.

      // Extract the first (and only) set of error details. The values of this
      // object are the script's 'errorMessage' and 'errorType', and an array
      // of stack trace elements.
      const error = resp.error.details[0];
      console.log(`Script error message: ${error.errorMessage}`);
      console.log('Script error stacktrace:');

      if (error.scriptStackTraceElements) {
        // There may not be a stacktrace if the script didn't start executing.
        for (let i = 0; i < error.scriptStackTraceElements.length; i += 1) {
          const trace = error.scriptStackTraceElements[i];
          console.log('\t%s: %s', trace.function, trace.lineNumber);
        }
      }
    }
  });
}


module.exports = scriptFunction;
