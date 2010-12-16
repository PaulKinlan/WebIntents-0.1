onconnect = function(e) {
  console.log("connected");
  var port = e.ports[0];
  port.postMessage('Hello World!');
  port.addEventListener("message", function(m) {
    console.log(m)
  });
};