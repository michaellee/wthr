#!/usr/bin/env node

require('dotenv').config()
const https = require('https')
const moment = require('moment')
const emojic = require('emojic')

var apiKey = process.env.FORECASTIO_API_KEY 
var coordinates = {
  latitude: '35.8059',
  longitude: '-78.7997'
}

var options = {
  host: 'api.forecast.io',
  path: '/forecast/' + apiKey + '/' + coordinates.latitude + ',' + coordinates.longitude
}

var emojifyWeather = function (icon){
  var icons = {
    'clear-day': 'sunny',
    'clear-night': 'star2',
    'rain': 'cloudWithRain',
    'snow': 'snowflake',
    'sleet': 'cloudWithSnow',
    'wind': 'windBlowingFace',
    'fog': 'fog',
    'cloudy': 'cloud',
    'partly-cloudy-day': 'partlySunny',
    'partly-cloudy-night': 'cloud'
  }

  if(icons.hasOwnProperty(icon)){
    return eval('emojic.' + icons[icon]) + '  '
  }else {
    return ''    
  }
}

https.get(options, function(res) {
  var body = ""
  res.on("data", function(chunk) {
    body += chunk 
  });

  res.on('end', function(){
    var data = JSON.parse(body).currently
    var icon = emojifyWeather(data.icon)
    var temp = Math.floor(data.temperature) + '°F'
    var time = moment.unix(data.time).format('LT')
    console.log(icon + 'It\'s currently ' + temp + ' and ' + data.summary.toLowerCase() + ' at ' + time + '.')
  })
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});
