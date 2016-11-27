var fs = require('fs');
var config = JSON.parse(fs.readFileSync('./headerConfig.json', 'utf8'));
module.exports = config;
