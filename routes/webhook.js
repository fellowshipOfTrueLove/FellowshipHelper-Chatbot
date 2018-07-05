module.exports = function(app, db, client) {

  const BotModule = require('../bot_module')(db);

  app.post('/webhook', (req, res) => {
    BotModule.trigger(req.body.trigger, req.body);
    res.sendStatus(200);
  });

  BotModule.on('onFormSubmit', (payload) => {
    if (payload.form != "RegularTrain" && payload.form != "SharingTrain") return false;

    db.collection('posts').add(payload);

    const usersRef = db.collection('users');
    const statusRef = db.collection('biblebot').doc('status');
    let message = '';

    if(payload.form == "RegularTrain"){
      message += `[經文列車]
本日列車長 - ${payload.name}
下位列車長 - ${payload.next}\n`

      usersRef.where('username', '==', payload.next).get().then((qSnapshot) => {
        qSnapshot.forEach((userDoc) => {
          const user = userDoc.data();
          console.log(`Next - ${JSON.stringify(user.username)}`);
          statusRef.update({ nextUserId: user.userId });
        });
      });
    }else{
      message += `[額外分享]
分享者 - ${payload.name}\n`
    }

    message +=`\n<${payload.origin}>\n${payload.verse}`;
    message += (payload.comments == '') ? '' : `\n\n心得:\n${payload.comments}`;

    usersRef.where('username', '==', payload.name).get().then((qSnapshot) => {
      qSnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        console.log(`Current - ${JSON.stringify(user.username)}`);
        db.collection('users').doc(user.userId).update({
          lastSubmit: payload.timestamp,
          remindCount: 0,
          submitCount: user.submitCount + 1,
        });
      });
    });

    announce(message).then(() => {
      BotModule.formUpdate();
    });

    return true;
  });

  BotModule.on('onDailyReminder', (payload) => {
    const statusRef = db.collection('biblebot').doc('status');
    BotModule.formUpdate();
    return statusRef.get().then((snapshot) => {
      const status = snapshot.data();
      const userRef = db.collection('users').doc(status.nextUserId);
      return userRef.get().then((snapshot2) => {
        const user = snapshot2.data();
        if (user.isEnabled) {
          const message = `${user.username}，\n今天是你當列車長喔！\n記得找時間來填經文列車~`;
          if (user.isFriend) {
            pushMessage(user.userId, message);
          }
          userRef.update({
            remindCount: user.remindCount + 1,
          });
        } else {
          const message = `${user.username}跳槽了，認命吧 WWW`;
          statusRef.update({ nextUserId: 'U8d37399db825fc670ff411a7aec672eb' });
          pushMessage('U8d37399db825fc670ff411a7aec672eb', message);
        }
        return true;
      });
    });
  });

  // Functions

  function announce(message){
    const groupsRef = db.collection('groups');

    return groupsRef.get().then((qSnapshot) => {
      qSnapshot.forEach((groupDoc) => {
        const group = groupDoc.data();
        pushMessage(group.id, message).then(() => {
          console.log(`Post delivered to ${group.name}`);
        });
      });
    });
  }

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
