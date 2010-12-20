var channel = new (function() {
  //var origin = "://webintents.appspot.com/host.html"; // << Need to sort out a better way -
  
  var origin = "//localhost:8113/host.html"; // << Need to sort out a better way -
  
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
      callback();
    });
    window.document.body.appendChild(iframe);
  };
  
  var processMessage = function (event) {
    var data = event.data;
    var eventOrigin = event.source;
    
    // The response function is used to send data back to the client.
    // In this case the iframe.  The iframe will route the message back.
    var response = function(data) {
      eventOrigin.postMessage(data);
    };
    
    // Direct the data to the correct callback
    if(callbacks[data.method])
      callbacks[data.method](data, response);
  };
  
  /*
    Publish a message in to the system, any system that is listening for events
    will get notified of the message.
  */
  this.send = function(method, data, callback) { 
    var message = {
      "method": method,
      "data" : data
    };
    
    iframe.contentWindow.postMessage(message, "*");
  };
  
  
  /*
    Discover all the Intents that can handle our message
  */
  this.discover = function(method, data, callback) {
    var message = {
      "method": window.location.toString() + "#" + method,
      "data" : data
    };
    
    var container = {
      "method" : window.location.toString() + "#discover",
      "data" : message
    };
    
    // only one callback per method, should be multiple.
    callbacks[window.location.toString() + "#discover"] = callback;
    
    iframe.contentWindow.postMessage(container, "*");
  };
  
  
  /*
    Registers an intent with the system.
    
    An Intent is a task or operation to be performed.  Each
  
  */
  this.registerIntent = function(method, data, callback) {
     var message = {
       "method": window.location.toString() + "#" + method,
       "data" : data
     };

     var container = {
       "method" : window.location.toString() + "#register",
       "data" : message
     };

     // Add this call back into a collection of valid callbacks
     callbacks[window.location.toString() + "#" + method] = callback;
     // Set up the method that is called when the application recieves messages.
     iframe.contentWindow.postMessage(message, "*");
   };
})();