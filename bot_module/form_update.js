
const scriptFunction = require('./google_script');

const scriptList = ["1hGHmoyy6WyIRTWR3ph6FC9-jne7yWydfrCLltQf8cjYx36_5ig6JYn0J",
        "1pnk9fcRby59fLPB3C0sQXD6O_06Mg33pJBPh01CypUzBgJ5k2MqmVvpE"];

function FormUpdate(db){
  const usersRef = db.collection('users');
  const statusRef = db.collection('biblebot').doc('status');

  return statusRef.get().then((snapshot) => {
    const status = snapshot.data();
    return usersRef.where('isEnabled', '==', true).orderBy('lastSubmit').get().then((qSnapshot) => {
      const users = [];
      const nextUsers = [];
      qSnapshot.forEach((userDoc) => {
        const user = userDoc.data();
        if (user.userId === status.nextUserId) {
          users.unshift(user.username);
        } else {
          users.push(user.username);
          nextUsers.push(`${user.username} - ${daysAgo(user.lastSubmit)}`);
        }
      });
      scriptList.forEach((scriptId) => {
        scriptFunction(db, scriptId, 'refresh', [users, nextUsers]);
      });
    });
  });
}

function daysAgo(lastSubmit) {
  if (lastSubmit) {
    const today = new Date();
    lastSubmit = new Date(lastSubmit);
    lastSubmit.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastSubmit) / (24 * 60 * 60 * 1000));
    if (daysDiff < 1) {
      return ('Today');
    } else if (daysDiff === 1) {
      return ('Yesterday');
    }
    return (`${daysDiff} days ago`);
  }
  return ('Never');
}

module.exports = FormUpdate;
