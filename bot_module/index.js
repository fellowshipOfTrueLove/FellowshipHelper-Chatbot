const EventEmitter = require('./event_emitter');
const GoogleScript = require('./google_script');
const FormUpdate   = require('./form_update');

function BotModule(db){

  return {
    trigger: (eventName, ...args) => {
      console.log(`\nEvent triggered - ${eventName}`);
      EventEmitter.emit(eventName, ...args);
    },
    fallback: (eventName, fallback) => {
      EventEmitter.fallback(eventName, fallback);
    },
    on: (eventName, handler) => {
      EventEmitter.addListener(eventName, handler);
    },
    hears(pattern, handler) {
      EventEmitter.addListener('message', (event) => {
        if (!pattern.test(event.message.text)) return false;

        handler(event);
        return true;
      });
    },
    scriptFunction: (...args) => {
      GoogleScript(db, ...args)
    },
    formUpdate: () => {
      FormUpdate(db)
    },
  };

};

module.exports =  BotModule;
