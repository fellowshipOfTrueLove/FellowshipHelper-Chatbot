var EventEmitter = (function (){

  var listeners = [];
  var fallbacks = {};

  return {
    addListener: (eventName, handler) => {
      listeners.push({ eventName, handler, });
    },
    fallback: (eventName, handler) => {
      fallbacks[eventName] = handler;
    },
    emit: (eventName, ...args) => {
      let eventListeners = listeners.filter(listener =>
        listener.eventName === eventName
      ).map(listener =>
        listener.handler
      );

      let matched = false;
      while(!matched && eventListeners.length > 0){
        let handler = eventListeners.shift();
        matched = handler(...args)
      }

      if(!matched){
        let handler = fallbacks[eventName];
        if (handler) {
          handler.apply(this, args);
        } else {
          console.error(`Unhandled event ${eventName}`);
        }
      }
    },
  };
})();

module.exports =  EventEmitter;
