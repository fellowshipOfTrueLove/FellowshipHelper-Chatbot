const BotModule = require('../bot_module');

module.exports = function(app, db, client) {

  app.post('/line_webhook', (req, res) => {
    const { events } = req.body;
    events.forEach((event) => {
      if (event.type === 'message') {
        if ((event.source.type === 'user' ||
          /@.*([Hh]elper|[Bb]ible *[Bb]ot)/.test(event.message.text))
          && event.message.type === 'text') {
          BotModule.trigger(event.type, event);
        }
      }else{
        BotModule.trigger(event.type, event);
      }
    });
    res.sendStatus(200)
  });

  BotModule.fallback("message", (event) => {
    return replyMessage(event.replyToken, event.message.text);
  });

  BotModule.on("follow", (event) => {
    return replyMessage(event.replyToken, "New Follow!");
  });

  BotModule.hears(/DOG/, (event) => {
    return replyMessage(event.replyToken, "I hear dogs");
  });

  function replyMessage(replyToken, message) {
    client.replyMessage(replyToken, processMessage(message)).catch((err) => {
      console.log(err);
    });
    return true;
  };
};

function processMessage(message) {
  if (typeof message !== 'object') {
    message = {
      type: 'text',
      text: message,
    };
  }
  return (message);
}
