var ports = {};
var register = "#register";
var callbacks = {};

onconnect = function(e) {
  var port = e.ports[0];
  
  port.onmessage = function(evt) {
    // Route the message to the correct handler.
    var data = evt.data;
    
    if(data.method.substr(-9) == register) {
      // We have recieved a register command.
      ports[data.data.method] = port;
    }
    else {
      // Send a message to the app that knows it can handle this.
      callbacks[data.id] = port;
      if(callbacks[data.inReplyTo]) {
        // There is a callback for this, so find the correct port.
        callbacks[data.inReplyTo].postMessage(data);
      }
      else {
        // It is a straight method with a known url
        ports[data.method].postMessage(data);
      }
    }
  };
}



