var express = require('express');
var http = require('http');
var config = require('../../config/config');
var utility = require('../utility/utility');
var apiRoutes = express.Router();

apiRoutes.post('/login', function (req, res) {
	var client = {}
	req.session.isAuthenticated = false;
	//session.clientIP = req.connection.remoteAddress;
	client.clientIP = req.body.payLoad.remoteIP || req.connection.remoteAddress;
	
    var options = {
        hostname: config.hostname,
        port: config.hostPort,
        path: '/login',
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
            var _results = JSON.parse(result);
            if (_results.status.code == 1 && _results.result.v_ReturnCode == 0) {
            	req.session.auth = _results.result;
            	req.session.client = {};
            	req.session.client.clientIP = req.connection.remoteAddress;
            	req.session.isAuthenticated = true;
            }
            res1.send(result);
            res1.end();
        })
    });

    req2.on('error', function (e) {
        console.log('problem with request: ' + e.message);
    });


    //req.body.session = client;
    req.body.header = utility.getPlatformHeader(req);
	// write data to request body
    var t = JSON.stringify(req.body);
	//req2.setHeader('Content-Length', Buffer.byteLength(req.body));
    req2.write(t);
    req2.end();

});

apiRoutes.post('/logout', function (req, res) {

    if (req.session) {
        req.session.destroy(function (r) {
            res.send("Logout Successfully");
            res.end();
        });
    } 
});
module.exports = apiRoutes;