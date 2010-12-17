var num_clients = 0;
var ports = [];

onconnect = function(e) {
  var port = e.ports[0];
  ports.push(port);
  port.onmessage = function(evt) {
    // Route the message to the correct handler.
    port.postMessage(evt.data);
  };
}



