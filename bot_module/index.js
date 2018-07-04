const EventEmitter = require('./event_emitter');

var BotModule = (function (){

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
        if (pattern.test(event.message.text)) {
          handler(event);
          return true
        }
        return false
      });
    },
  };

})();

module.exports =  BotModule;
