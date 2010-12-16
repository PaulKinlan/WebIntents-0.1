var channel = new (function() {
  //http://bpubsub.appspot.com:
  const origin = "http://localhost:8113/host.html";
  var w;
  var iframe;
  var callbacks = {};
  /*
    Initializes the framework
  */
  this.initialize = function(callback) {
    // create an iframe to the source of this application
    iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = origin;
    iframe.addEventListener("load", function() {
      // Handle all the messages directed to this app.
      window.addEventListener("message", processMessage);
      callback()
    });
    window.document.body.appendChild(iframe);
    
    
  };
  
  var processMessage = function (event) {
    var data = JSON.parse(event.data);
    var eventOrigin = event.source;
    
    // Direct the data to the correct callback
    callbacks[data.method](data);
  };
  
  /*
    Subscribes to a message source.
  */
  this.subscribe = function(method, callback) {
    var message = {
      "type" : "subscribe",
      "method" : method
    };
    
    iframe.contentWindow.postMessage(JSON.stringify(message), origin);
    // Whenever a message is recieved, call this callback.
    callbacks[fullMethod] = callback;
  };
  
  /*
    Publish a message in to the system, any system that is listening for events
    will get notified of the message.
  */
  this.publish = function(method, data) { 
    var message = {
      "type" : "publish",
      "method": window.location.toString() + method,
      "data" : data
    };
    
    iframe.contentWindow.postMessage(JSON.stringify(message), "*");
  };
  
  
  /*
    Discover all the Intents that can handle our message
  */
  this.discover = function(method, data, callback) {
    var message = {
      "type" : "discover",
      "channel": window.location.toString() + "#discover",
      "method" : method,
      "data" : data
    };
    
    // only one callback per method, should be multiple.
    callbacks[method] = callback;
    
    iframe.contentWindow.postMessage(JSON.stringify(message), "*");
  };
  
  /*
    Register a channel with the system.
    
    A channel allows apps to pump messages to any app that will listen.
    
    The channel can be bi-directional, so that apps can respond to the messages
    
  */
  this.registerChannel = function(method, callback) {
    var channel = "pub";
    
    if(callback) {
      channel = "pubsub"
    }
    
    var message = {
      "type" :  "register",
      "channel" : channel,
      "method": method
    };
    
    // Set up the method that is called when the application recieves messages.
    iframe.contentWindow.postMessage(JSON.stringify(message), origin);
  };
  
  /*
    Registers an intent with the system.
    
    An Intent is a task or operation to be performed.  Each
  
  */
  this.registerIntent = function(method, data, callback) {
     
     var message = {
       "type" :  "register",
       "channel" : window.location.origin,
       "method": method,
       "data" : data
     };

     // Set up the method that is called when the application recieves messages.
     iframe.contentWindow.postMessage(JSON.stringify(message), "*");
   };
})();