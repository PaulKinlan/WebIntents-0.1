/*
 The service resides on the remote host and orchastrates the communication
 between

*/

/*var w = new SharedWorker("w.js");
w.port.onmessage = function(e) { // note: not worker.onmessage!
  alert(e.data);
}*/

window.channel = new (function() {
  var self = this;
  var sourceWindow = null; // There can only actually be one source window for this iframe.
  self.worker = new SharedWorker("worker.js");
  
  self.worker.onerror = function(err) { 
    console.log(err);
  }
  
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
    
    this.worker.port.addEventListener("message", this.processMessage, false);
    this.worker.port.start();
    
    window.addEventListener("message", this.processMessage, false);
  };
  
  /*
    Processes all messages 
  */
  this.processMessage = function(event) {
    
    console.log(event.data);
    
    var data = event.data;
    
    if(!!data.type == false) {
      return;
    }
    
    var source = event.source;
    var method = data.type;
    if(self.apis[method]) {
      self.apis[method](source, data);
    }
    else {
      // The message is a response to a call
      sourceWindow.postMessage(data, "*");
    }
  };
  
  /*
    The third party application wants to subcribe to a feed.
  */
  this.subscribe = function(source, data) {
    return;
  };
  
  /*
    An application registers itself wanting to be able to send messages or register as an intent.
  */
  this.register = function(source, data) {
    var method = data.method;
    var channel = data.channel;
    
    // The first window to register the handler is the source (the return destination)
    sourceWindow = source;
    
    var handlers = {};
    
    // This can't be quick.
    if(!!localStorage[method]) {
      handlers = JSON.parse(localStorage[method]);
    }
    
    // This will overwrite an existing channel - clients shouldn't be able to 
    // spoof
    handlers[channel] = data;
    localStorage[method] = JSON.stringify(handlers);
    // Register the port with the Worker
    self.worker.port.postMessage(data);
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
    
    source.postMessage(data, "*"); // Send the message back to the consumer
  };
  
  /*
    Publishes a message into the system.
    
    Find the handlers, that are will to handle this message
  
  */
  this.publish = function(source, data) {
    self.worker.port.postMessage(data);
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