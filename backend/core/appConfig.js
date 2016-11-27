var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./appConfigLive.json', 'utf8'));

module.exports = config;

