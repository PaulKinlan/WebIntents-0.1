var num_clients = 0;
var ports = {};

onconnect = function(e) {
  var port = e.ports[0];
  port.onmessage = function(evt) {
    // Route the message to the correct handler.
    var url = evt.data.channel + "#" + evt.data.method;
    if(evt.data.type == "register") {
      // The app is registering itself
      ports[url] = port;
    }
    else {
      // Send a message to the app.
      ports[url].postMessage(evt.data);
    }
    
    
  };
}



