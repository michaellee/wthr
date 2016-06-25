#!/usr/bin/env node

const https = require('https')

var apiKey = 'bcd6b8865cccc61aa52d12f0d0bc0939'
var coordinates = {
  latitude: '35.8059',
  longitude: '-78.7997'
}

var options = {
  host: 'api.forecast.io',
  path: '/forecast/' + apiKey + '/' + coordinates.latitude + ',' + coordinates.longitude
};

https.get(options, function(res) {
  var body = ""
  res.on("data", function(chunk) {
    body += chunk 
  });

  res.on('end', function(){
    var data = JSON.parse(body).currently
    console.log('It\'s currently ' + data.summary.toLowerCase() + '.')
  })
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
