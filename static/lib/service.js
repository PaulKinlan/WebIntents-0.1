/*
 The service resides on the remote host and orchastrates the communication
 between

*/

window.channel = new (function() {
  var self = this;
  var sourceWindow = null; // There can only actually be one source window for
  var knownhandlers = {};
  
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
    
    this.apis["#register"] = this.register;
    this.apis["#discover"] = this.discover;
    this.apis["#publish"] = this.publish;
    this.apis["#subscribe"] = this.subscribe;
    
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
    
    var source = event.source;
    var method = data.method.substr(data.method.indexOf("#"));
    if(self.apis[method]) {
      self.apis[method](source, data);
    }
    else if(knownhandlers[data.method]) {
      // the app knows how to handle this, send it there.
      sourceWindow.postMessage(data, "*");
    }
    else {
      // Send it out on to the Shared worker so it can find where to send it.
      self.worker.port.postMessage(data);
    }
  };
  
  /*
    An application registers itself as an intent.
  */
  this.register = function(source, data) {
    var method = data.channel.substr(data.channel.indexOf("#"));
    
    // The first window to register the handler is the source (the return destination)
    sourceWindow = source;
    var handlers = {};
    // This can't be quick.
    if(!!localStorage[method]) {
      handlers = JSON.parse(localStorage[method]);
    }
    
    // This will overwrite an existing channel - clients shouldn't be able to 
    // spoof
    
    // Register the port with the Worker
    self.worker.port.postMessage(data);
    
    data.method = data.channel;
    delete data.channel;
    
    handlers[data.method] = data;
    knownhandlers[data.method] = data;
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
    var method = data.channel.substr(data.channel.indexOf("#"));
    
    data.intents = JSON.parse(localStorage[method]);
    
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