#!/usr/bin/env node
const https = require('https')
const moment = require('moment')
const emojic = require('emojic')
const program = require('commander')
const fs = require('fs')
const co = require('co')
const prompt = require('co-prompt')

var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
var defaultConfigPath = home + '/.wthr_config'

var configFileExists = null

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

var convertToC = function (fahrenheit){
  return Math.round((fahrenheit - 32) * 5 / 9)
}

var convertToF = function (celsius){
  return Math.round((celsius * 9 / 5) + 32)
}

var getWeather = function (config, callback){
  var options = {
    host: 'api.forecast.io',
    path: '/forecast/' + config.forecastioAPI + '/' + config.latitude + ',' + config.longitude
  }
  
  https.get(options, function(res) {
    var body = ""
    res.on("data", function(chunk) {
      body += chunk 
    });

    res.on('end', function(){
      var data = JSON.parse(body).currently
      var icon = emojifyWeather(data.icon)
      var temp = config.unit === 'F' ? Math.round(data.temperature) : convertToC(data.temperature)
      temp += '°' + config.unit
      var time = moment.unix(data.time).format('LT')
      var weather = icon + 'It\'s currently ' + temp + ' and ' + data.summary.toLowerCase() + ' at ' + time + '.'
      callback(weather)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  })
}

try {
  configFileExists = fs.statSync(defaultConfigPath).isFile()
} catch (e) {
  configFileExists = false
}

if(configFileExists){
  var obj = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'))
  
  getWeather(obj, function(weather){
    console.log(weather)
    process.exit()
  })
} else {
  co(function * () {
    var forecastioAPI = yield prompt('What is your forecast.io API key? If you don\'t have one, get one at https://developer.forecast.io: ')
    var latitude = yield prompt('What is your location\'s latitude? Don\'t know what it is? Get it at https://google-developers.appspot.com/maps/documentation/utils/geocoder/: ')
    var longitude = yield prompt('What is your location\'s longitude? ')
    var unit = yield prompt('Would you like your temperature in celius or fahrenheit? Please use (C or F): ')
    
    var config = {
      'forecastioAPI': forecastioAPI,
      'latitude': latitude,
      'longitude': longitude,
      'unit': unit
    }

    fs.closeSync(fs.openSync(defaultConfigPath, 'w'))
    fs.writeFileSync(defaultConfigPath, JSON.stringify(config, '', 2))

    getWeather(config, function(weather){
      console.log(weather)
      process.exit()
    })
    
  })
}
