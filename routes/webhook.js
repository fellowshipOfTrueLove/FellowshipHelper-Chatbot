const BotModule = require('../bot_module');

module.exports = function(app, db, client) {

  app.post('/webhook', (req, res) => {
    BotModule.trigger(req.body.trigger, req.body);
    res.sendStatus(200);
  });

  BotModule.on('onFormSubmit', (payload) => {
    if (payload.form != "SharingTrain") return false;

    console.log("Hes")

    return true
  });

  BotModule.on('onFormSubmit', (payload) => {
    if (payload.form != "RegularTrain") return false;

    db.collection('posts').add(payload);

    let message = `\
[經文列車]
本日列車長 - ${payload.name}
下位列車長 - ${payload.next}\n
<${payload.origin}>
${payload.verse}`;

    message += (payload.comments == '') ? '' : `心得:\n${payload.comments}`;

    // Send line message to all groups
    const groupsRef = db.collection('groups');

    groupsRef.get().then((qSnapshot) => {
      qSnapshot.forEach((groupDoc) => {
        const group = groupDoc.data();
        pushMessage(group.id, message).then(() => {
          console.log(`Post delivered to ${group.name}`);
        });
      });
    });

    return true;
  });

  BotModule.on('onMidnightPush', (payload) => {
    console.log(payload)
  });

  // functions
  function pushMessage(recieverId, message) {
    return client.pushMessage(recieverId, processMessage(message))
      .catch((err) => {
        console.log(err);
      });
  }

  function processMessage(message) {
    if (typeof message !== 'object') {
      message = {
        type: 'text',
        text: message,
      };
    }
    return (message);
  }

};
