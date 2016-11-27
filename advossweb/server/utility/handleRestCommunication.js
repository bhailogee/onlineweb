var http = require('http');
var config = require('../../config/config');
var utility = require('../utility/utility');
var schema = require("../schemaparser/schemaparser.js");
var extend = require('extend');
var net = require('net');

var handleRequest = {
	sendRequest: function (req, res, next) {
		var schemaMethodObject = schema.getSchemaMethodByRoute(req.route.methods, req.route.path);
		var options = handleRequest.getOptions(req.route.path, utility.getFirstTrue(req.route.methods));
		
		var req2 = http.request(options, function (res2) {			
			var result = "";			
			res2.setEncoding('utf8');
			res2.on('data', function (chunk) {
				result += chunk;
			});
			res2.on('end', function () {
				//var _results = JSON.parse(result);
				//debugger;
				//console.log(JSON.stringify(result));
				//if (_results.result && _results.result.v_ReturnCode == 0) {
				//	req.session.auth = _results.result;
				//	req.session.client = {};
				//	req.session.client.clientIP = req.connection.remoteAddress;
				//	req.session.isAuthenticated = true;
				//}
				//else {
				//	res1.send('');
				//	res1.end();
				//}
				try {
					var result2 = JSON.parse(result);
					if (result2.authToken) {

						res.cookie('authToken', result2.authToken, { maxAge: config.SessionExpiry });


						result2.authToken = null;
						delete result2.authToken;
					}

					res.send(JSON.stringify(result2));
					res.end();

				} catch (e) {
					res.send("Error in api manager: " + result);
					res.end();
				}
			})
		});

		req2.on('error', function (e) {
			console.log('problem with request: ' + e.message);
			var error = {};
			error.error = e;
			res.send(error);
		});

		var reqBody = req.body;
		//req.body.session = client;
		reqBody.header = utility.getPlatformHeader(req, config);
		reqBody.schema = schemaMethodObject;
		reqBody = extend(true, reqBody, req.params);
		reqBody = extend(true, req.query, reqBody);

		// write data to request body
		var t = JSON.stringify(reqBody);
		//req2.setHeader('Content-Length', Buffer.byteLength(req.body));
		req2.write(t);
		req2.end();

	},
	getOptions: function (path,method) {
		var options = {
			hostname: config.hostname,
			port: config.hostPort,
			path: path,
			method: method,
			headers: {
				'Content-Type': 'application/json'
			}
		};
		return options;
	}
}


module.exports = handleRequest;