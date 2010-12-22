/*
 The service resides on the remote host and orchastrates the communication
 between iframes and client applications.
*/

window.channel = new (function() {
  var self = this;
  var sourceWindow = null; // There can only actually be one source window for
  var knownhandlers = {};
  var callbacks = {};
  
  self.worker = new SharedWorker("/lib/worker.js");
  
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
    
    window.addEventListener("message", this.processAppMessages, false);
  };
  
  /*
    Processes messags coming from the SharedWorker
  */
  this.processMessage = function(event) {
    var data = event.data;
    
    var source = event.source;
    var method = data.method.substr(data.method.indexOf("#"));
    if(self.apis[method]) {
      // The message is a special message.
      self.apis[method](source, data);
    }
    else if(callbacks[data.inReplyTo]) {
      // The message is a reply to a previously sent message so send it there
      //callbacks[data.inReplyTo](data);
      sourceWindow.postMessage(data, "*");
    }
    else if(knownhandlers[data.method]) {
      // the app knows how to handle this, send it there, we should also 
      // set up a callback.
      sourceWindow.postMessage(data, "*");
    }
  };
  
  /*
    Messages coming from the app are always forwarded to the worker.
  */
  this.processAppMessages = function(event) {
    var data = event.data;
    var id = data.id;
    var source = event.source;
    
    var method = data.method.substr(data.method.indexOf("#"));
    
    if(self.apis[method]) {
      self.apis[method](source, data);
    }
    else {
      // register a callback endpoint
      callbacks[data.id] = function(d) {
        // Send the message to the app.
        sourceWindow.postMessage(d, "*");
      };
      
      // send the message onwards.
      self.worker.port.postMessage(data);
    }
  };
  
  /*
    An application registers itself as an intent.
  */
  this.register = function(source, data) {
    var message = data.data;
    var mm = message.method;
    var method = mm.substr(mm.indexOf("#"));
    
    sourceWindow = source;
    var handlers = {};
    // This can't be quick.  and it will be racey.. TODO: refactor
    if(!!localStorage[method]) {
      handlers = JSON.parse(localStorage[method]);
    }
    
    // This will overwrite an existing channel - clients shouldn't be able to 
    // spoof
    
    // Register the port with the Worker
    self.worker.port.postMessage(data);
    
    handlers[method] = message;
    knownhandlers[mm] = message;
    localStorage[method] = JSON.stringify(handlers);
  };
  
  
  /*
    When a client uses an intent, the first thing it will do is to ask
    webintents "who can handle" my method.
    
    Webintents will respond with a list of user discovered apps NOTE, how cool 
    would it be to keep a directory of these!?!?1!
  */
  this.discover = function(source, data) {
    var message = data.data;
    var mm = message.method;
    
    sourceWindow = source;
    
    // Get a list of apps that can handle the Intent
    var method = mm.substr(mm.indexOf("#"));
    
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
  
  this.init();
})();