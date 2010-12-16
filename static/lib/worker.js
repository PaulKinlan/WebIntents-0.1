onconnect = function(e) {
  console.log("connected");
  var port = e.ports[0];
  console.log("ports: " + e.ports.length);
  port.addEventListener("message", function(m) {
    console.log(m)
  });
};