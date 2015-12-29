var fs = require('fs');
var express = require('express');
var app = express();

const DIR_ROOT = require('path').normalize(__dirname+"/..");
const DIR_SOURCES = DIR_ROOT + "/sources";

app.get('/', function (req, res) {
  res.send('Clouduboy Cloud Compiler v0.1.3');
});

app.get('/build', function (req, res) {
  res.send(fs.readFileSync(DIR_SOURCES + '/arduboy-rund-ino/rund/rund.ino.leonardo.hex'));
});

app.get('/post', function (req, res) {
  var hex = fs.readFileSync(DIR_SOURCES + '/arduboy-rund-ino/rund/rund.ino.leonardo.hex');
  res.json({
    "result": {
      hex: hex
    }
  });
});

var server = app.listen(3204, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
