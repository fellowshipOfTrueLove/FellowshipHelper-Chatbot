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

  // Normal Non-Message Event

  BotModule.on("follow", (event) => {
    return getUserIdentity(event.source).then((profile) => {
      const localPromises = [];
      let response = `\
哈囉，${profile.username}。
我是真愛小幫手 Helper Bot。
你可以透過我來獲得各種有用的資訊。`;
      if(!profile.isEnabled){
        response = {
          type: "template",
          altText: "哈囉，" + profile.username + "。\n我是真愛小幫手 Helper Bot。\n你可以透過我來獲得各種有用的資訊。",
          template: {
            type: "confirm",
            text: "哈囉，" + profile.username + "。\n我是真愛小幫手 Helper Bot。\n請問你要搭上經文列車嗎？",
            actions: [
              {
                type: "postback",
                label: "好啊",
                data: JSON.stringify({action: "joinConfirm", result: true, userId: profile.userId, name: profile.username}),
                displayText: "好啊"
              }, {
                type: "postback",
                label: "先不要好了",
                data: JSON.stringify({action: "joinConfirm", result: false, userId: profile.userId, name: profile.username}),
                displayText: "先不要好了"
              }
            ]
          }
        };
      }

      if (!profile.isFriend) {
        db.collection('users').doc(profile.userId).update({isFriend: true});
      }
      return replyMessage(event.replyToken, response);
    });
  });

  BotModule.on("unfollow", (event) => {
    return getUserIdentity(event.source).then(function(profile) {
      db.collection('users').doc(profile.userId).update({isFriend: false});
      return true;
    });
  });

  BotModule.on("join", (event) => {
    var multiId;
    if (event.source.type == "group") {
      multiId = event.source.groupId;
    } else {
      multiId = event.source.roomId;
    }

    var groupRef = db.collection('groups').doc(multiId);
    return groupRef.set({id: multiId, type: event.source.type, name: "Unknown", timestamp: new Date()}).then(function() {
      var response = "哈囉~\n\
我是真愛小幫手 Helper Bot。\n\
如果你不知道要問我甚麼，就從'@HelperBot 幫助'開始吧!";
      return replyMessage(event.replyToken, response);
    });
  });

  BotModule.on("leave", (event) => {
    var multiId;
    if (event.source.type == "group") {
      multiId = event.source.groupId;
    } else {
      multiId = event.source.roomId;
    }
    return db.collection('groups').doc(multiId).delete();
  });

  // Normal Message Event

  BotModule.hears(/[Hh]elp|幫助|功能/, (event) => {
    return replyMessage(event.replyToken, "如果要找我，在對話框中打'@BibleBot'&指示，就可以了!\n\n\
我的功能列表如下：\n\
=> 查詢功能：功能/幫助/Help\n\
=> 更改暱稱：更改/Change\n\
=> 呼叫表單：表單/Form\n\
=> 查詢狀況：狀況/Status\n\
=> 加入列車：加入/Join\n\
=> 退出列車：離開/Leave\n\n\
另外我在群組&私訊都可以運作喔，如果不希望在群組加入/退出列車，歡迎加我好友&私訊我喔！");
  });

  BotModule.hears(/[Jj]oin|加入|上車/, (event) => {
    return getUserIdentity(event.source).then(function(profile) {
      var userRef = db.collection('users').doc(profile.userId);
      return userRef.update({isEnabled: true}).then(function() {
        var response = profile.username + "，\n\
歡迎搭乘經文列車!\n讓我們啟航吧!";
        if (event.source.type != "user" && !profile.isFriend) {
          response += "\n\n請記得加我好友，我才能寄給你提醒訊息喔！"
        }
        return replyMessage(event.replyToken, response);
      });
    });
  });

  BotModule.hears(/[Ll]eave|離開|下車/, (event) => {
    return getUserIdentity(event.source).then(function(profile) {
      var userRef = db.collection('users').doc(profile.userId);
      return userRef.update({isEnabled: false}).then(function() {
        var response = profile.username + "，\n謝謝您搭乘經文列車!\n讓我們有空時再會!";
        return replyMessage(event.replyToken, response);
      });
    });
  });

  BotModule.hears(/[Ss]tatus|狀況/, (event) => {
    return db.collection('biblebot').doc('status').get().then(function(snapshot) {
      var status = snapshot.data();
      return db.collection('users').where('isEnabled', '==', true).get().then(function(qSnapshot) {
        var users = [];
        var nextUserName;
        qSnapshot.forEach(function(userDoc) {
          var user = userDoc.data();
          if (user.userId == status.nextUserId) {
            nextUserName = user.username;
          }
          users.push(user.username);
        });
        response = "[列車資訊]\n下位列車長 - " + nextUserName + "\n目前乘客 - " + users.join('、');

        return replyMessage(event.replyToken, response);
      });
    });
  });

  BotModule.hears(/[Ff]orm|表單/, (event) => {
    return replyMessage(event.replyToken, {
      "type": "template",
      "altText": "表單連結：https://goo.gl/forms/6Zu6kKf4aR0UczAH3",
      "template": {
        "type": "buttons",
        "text": "真愛團契經文列車",
        "thumbnailImageUrl": "https://lh3.googleusercontent.com/sg8XyC-IuDLkm27UpOPbbat1q3S2trJu85TGVuWeDLtVs5bKXbZxcLcOhJSZDGoi4zil98WBww",
        "actions": [
          {
            "type": "uri",
            "label": "開啟經文表單",
            "uri": "https://goo.gl/forms/6Zu6kKf4aR0UczAH3"
          }
        ]
      }
    });
  });

  // Change User name

  BotModule.hears(/[Cc]hange|更改|改[暱名]稱/, (event) => {
    return getUserIdentity(event.source).then(function(profile) {
      var userRef = db.collection('users').doc(profile.userId);
      return userRef.update({chatState: 'changeName'}).then(function() {
        var response = profile.username + "，\n請輸入你新的暱稱：\n\n\
若你在群組，請在名稱前打'@Helper'並空一格\n\
例：@Helper Michael";
        replyMessage(event.replyToken, response);
      });
    });
  });

  BotModule.fallback("message", (event) => {
    return getUserIdentity(event.source).then(function(profile) {

      if (profile.chatState == 'changeName') {

        var name = event.message.text.replace(/@.*([Hh]elper|[Bb]ible *[Bb]ot) */, "");
        return db.collection('users').where('username', '==', name).get().then(function(qSnapshot) {

          if (qSnapshot.empty) {
            response = {
              type: "template",
              altText: "請用手機看 QQ，\n電腦沒辦法看按鈕 WWW",
              template: {
                type: "confirm",
                text: profile.username + "，\n你確定要把名稱換成 '" + name + "' 嗎？",
                actions: [
                  {
                    type: "postback",
                    label: "是的",
                    data: JSON.stringify({action: "changeNameConfirm", result: true, userId: profile.userId, name: name}),
                    displayText: "是的，我希望把名稱改成 '" + name + "'"
                  }, {
                    type: "postback",
                    label: "不要",
                    data: JSON.stringify({action: "changeNameConfirm", result: false, userId: profile.userId, name: name}),
                    displayText: "不要"
                  }
                ]
              }
            }
          } else {
            response = profile.username + "，\n這個名字已經有人使用了，請再輸入其他的名稱。";
          }

          return replyMessage(event.replyToken, response);
        });

      } else {
        response = `\
${profile.username}，你在找我嗎？
如果你不知道要問我甚麼，就從'@Helper 幫助'開始吧!`;
        return replyMessage(event.replyToken, response);
      }
    });
  });

  BotModule.on("postback", (event) => {
    var data = JSON.parse(event.postback.data);
    // Check if user who clicked the button is the intended target.
    if (data.userId == event.source.userId) {
      //換名稱確認
      if (data.action == "changeNameConfirm") {
        if (data.result) {
          var userRef = db.collection('users').doc(event.source.userId);
          return userRef.update({chatState: 'normal', username: data.name}).then(function() {
            var response = data.name + "，\n你的暱稱更新完成了！";
            return replyMessage(event.replyToken, response);
          });
        } else {
          var response = "那請再輸入一次希望的名稱。"
          return replyMessage(event.replyToken, response);
        }
      }else if(data.action == "joinConfirm"){
        var userRef = db.collection('users').doc(event.source.userId);
        var response = "沒問題，\n你想要加入時在下面輸入'加入'或'Join'即可~"
        if (data.result) {
          response = data.name + "，\n歡迎搭乘金句列車!\n讓我們啟航吧!";
        }
        return userRef.update({isEnabled: data.result}).then(function() {
          return replyMessage(event.replyToken, response);
        });
      }
    }
    return Promise.resolve();
  });

  // Functions

  function replyMessage(replyToken, message) {
    client.replyMessage(replyToken, processMessage(message)).catch((err) => {
      console.log(err);
    });
    return true;
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

  function getUserIdentity(source) {
    const userRef = db.collection('users').doc(source.userId);
    return userRef.get().then((snapshot) => {
      if (!snapshot.exists) {
        console.log('Retrieve user info from Line.');
        switch (source.type) {
          case 'room':
            return client.getRoomMemberProfile(source.roomId, source.userId)
              .then(createUserIdentity);
          case 'group':
            return client.getGroupMemberProfile(source.groupId, source.userId)
              .then(createUserIdentity);
          default:
            return client.getProfile(source.userId)
              .then(createUserIdentity);
        }
      } else {
        return snapshot.data();
      }
    });
  }

  function createUserIdentity(profile) {
    const localProfile = profile;
    localProfile.username = profile.displayName;
    localProfile.chatState = 'normal';
    localProfile.isEnabled = false;
    localProfile.isFriend = false;
    localProfile.lastSubmit = null;
    localProfile.submitCount = 0;
    localProfile.remindCount = 0;
    return db.collection('users').doc(profile.userId).set(profile).then(() => localProfile);
  }
};
