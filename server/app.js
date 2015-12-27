var fs = require('fs');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Clouduboy Cloud Compiler v0.1.1');
});

app.get('/build', function (req, res) {
  res.send(fs.readFileSync('../arduino-rund-ino/rund/rund.ino.leonardo.hex'));
});

var server = app.listen(3204, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
