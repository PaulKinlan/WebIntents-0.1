var ports = {};

onconnect = function(e) {
  var port = e.ports[0];
  
  port.onmessage = function(evt) {
    // Route the message to the correct handler.
    var data = evt.data;
    
    if(data.channel) {
      // there is only a channel on specific system commands.
      ports[data.channel] = port;
    }
    else {
      // Send a message to the app that knows it can handle this.
      ports[data.method].postMessage(evt.data);
    }
  };
}



