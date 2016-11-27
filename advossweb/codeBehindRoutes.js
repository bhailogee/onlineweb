var express = require('express');
var http = require('http');
var config = require('./config/config');
var apiRoutes = express.Router();

apiRoutes.all('/', function (req, res) {
    var options = {
        hostname: config.hostname,
        port: config.hostPort,
        path: config.defaultHostPath+"?apiName="+req.param('apiName',null),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    var req2 = http.request(options, function (res2) {
        var res1 = res;
        var result = "";
        console.log('STATUS: ' + res2.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res2.headers));
        res2.setEncoding('utf8');
        res2.on('data', function (chunk) {
            result += chunk;            
        });
        res2.on('end', function () {
            res1.send(result);
        })
    });

    req2.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req2.write(JSON.stringify(req.body));
    req2.end();
    
});

module.exports = apiRoutes;