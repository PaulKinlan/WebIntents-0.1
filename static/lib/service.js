/*
 The service resides on the remote host and orchastrates the communication
 between

*/
window.channel = new (function() {
  var self = this;
  //self.worker = new SharedWorker("/lib/worker.js", "browsers");
  this.services = {};
  this.apis = {};
  this.subscriptions = {};
  
  // Set up the recieve
  this.init = function() {
    // Register some subscription
    var location = window.location.toString();
    
    this.apis["register"] = this.register;
    this.apis["discover"] = this.discover;
    this.apis["publish"] = this.publish;
    this.apis["subscribe"] = this.subscribe;
    
    window.addEventListener("message", this.processMessage);
  };
  
  /*
    Processes all messages 
  */
  this.processMessage = function(event) {
    var data = JSON.parse(event.data);
    var source = event.source;
    
    if(!!data.type == false) {
      return;
    }
    
    var method = data.type;
    if(self.apis[method]) {
      self.apis[method](source, data);
    }
  };
  
  /*
    The third party application wants to subcribe to a feed.
  */
  this.subscribe = function(source, data) {
    var service = data.type;
    
    if(self.services[service]) {
      self.subscriptions[service].push({ 
        "service" : service,
        "handler" : source
      });
    }
  };
  
  /*
    An application registers itself wanting to be able to send messages or register as an intent.
  */
  this.register = function(source, data) {
    var method = data.method;
    var channel = data.channel;
    var sourceWindow = source;
    
    var handlers = {};
    
    // This can't be quick.
    if(!!localStorage[method]) {
      handlers = JSON.parse(localStorage[method]);
    }
    
    // This will overwrite an existing channel - clients shouldn't be able to 
    // spoof
    handlers[channel] = data;
    localStorage[method] = JSON.stringify(handlers);
  };
  
  
  /*
    When a client uses an intent, the first thing it will do is to ask
    webintents "who can handle" my method.
    
    Webintents will respond with a list of user discovered apps NOTE, how cool 
    would it be to keep a directory of these!?!?1!
  */
  this.discover = function(source, data) {
    // Get a list of apps that can handle the Intent
    
    data.intents = JSON.parse(localStorage[data.method]);
    
    source.postMessage(JSON.stringify(data), "*"); // Send the message back to the consumer
  };
  
  /*
    Publishes a message into the system.
    
    Find the handlers, that are will to handle this message
  
  */
  this.publish = function(source, data) {
    var method = data.method;
    var service = self.services[method];
    var newSource = service.source;
    
    service.handler(newSource, data);
  };
  
  this.postMessage = function(source, data) {
    var method = data.method;
    var subs = self.subscritpions[source];
    for(var sub in subs) {
      subs[sub].handler(source, data);
    }
  };
  
  this.init();
})();