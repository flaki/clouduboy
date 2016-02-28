var fs = require("fs");

var startList = getList();

function getList() {
  return fs.readdirSync("/dev/")
    ;//.filter(path => path.match(/^tty/));
}

console.log("Listening for device changes...");

setInterval(function() {
  var list = getList();
  var changed = false;

  // List device additions
  list.forEach(function(dev) {
    if (startList.indexOf(dev) === -1) {
      console.log("[+]", dev);
      changed = true;
    }
  });

  // List device removals
  startList.forEach(function(dev) {
    if (list.indexOf(dev) === -1) {
      console.log("[-]", dev);
      changed = true;
    }
  });

  //if (!changed) console.log(".");

  startList = getList();
}, 5);
