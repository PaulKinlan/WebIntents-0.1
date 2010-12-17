var num_clients = 0;
var ports = {};

onconnect = function(e) {
  var port = e.ports[0];
  port.onmessage = function(evt) {
    // Route the message to the correct handler.
    var data = evt.data;
    
    if(ports[data.channel]) {
      ports[data.channel] = port;
    }
    else {
      // Send a message to the app.
      ports[data.method].postMessage(evt.data);
    }
  };
}



