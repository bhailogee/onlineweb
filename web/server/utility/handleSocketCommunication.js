//var http = require('http');
var config = require('../../config/config');
var utility = require('../utility/utility');
var schema = require("../schemaparser/schemaparser.js");
var extend = require('extend');
var net = require('net');
var stringDecoder = require('string_decoder').StringDecoder;
var decoder = new stringDecoder('utf8');
var HOST = '127.0.0.1';
var PORT = 6969;

var handleRequest = {
	sendRequest: function (req, res, next) {
		var schemaMethodObject = schema.getSchemaMethodByRoute(req.route.methods, req.route.path);
		
		var options = handleRequest.getOptions(req.route.path, utility.getFirstTrue(req.route.methods));

		//var req2 = http.request(options, function (res2) {
		//	var result = "";
		//	res2.setEncoding('utf8');
		//	res2.on('data', function (chunk) {
		//		result += chunk;
		//	});
		//	res2.on('end', function () {
		//		//var _results = JSON.parse(result);
		//		//debugger;
		//		//console.log(JSON.stringify(result));
		//		//if (_results.result && _results.result.v_ReturnCode == 0) {
		//		//	req.session.auth = _results.result;
		//		//	req.session.client = {};
		//		//	req.session.client.clientIP = req.connection.remoteAddress;
		//		//	req.session.isAuthenticated = true;
		//		//}
		//		//else {
		//		//	res1.send('');
		//		//	res1.end();
		//		//}
		//		try {
		//			var result2 = JSON.parse(result);
		//			if (result2.authToken) {

		//				res.cookie('authToken', result2.authToken, { maxAge: config.SessionExpiry });


		//				result2.authToken = null;
		//				delete result2.authToken;
		//			}

		//			res.send(JSON.stringify(result2));
		//			res.end();

		//		} catch (e) {
		//			res.send("Error in api manager: " + result);
		//			res.end();
		//		}
		//	})
		//});

		//req2.on('error', function (e) {
		//	console.log('problem with request: ' + e.message);
		//	var error = {};
		//	error.error = e;
		//	res.send(error);
		//});

		var reqBody = req.body;
		//req.body.session = client;
		reqBody.header = utility.getPlatformHeader(req, config);
		reqBody.schema = schemaMethodObject;
		reqBody.payLoad = reqBody.payLoad || {};
		reqBody.payLoad = extend(true, reqBody.payLoad, req.params);
		reqBody.payLoad = extend(true, req.query, reqBody.payLoad);

		// write data to request body
		var t = JSON.stringify(reqBody);

		var client = new net.Socket();
		client.connect(PORT, HOST, function () {
			console.log('Connected');
			client.write(t);
		});
		var finalResult = "";

		client.on('data', function (result) {
			try {
				finalResult += decoder.write(result);
				var result2 = JSON.parse(finalResult);
				finalResult = "";
				if (result2.authToken) {
					res.cookie('authToken', result2.authToken, { maxAge: config.SessionExpiry });
					result2.authToken = null;
					delete result2.authToken;
				}

				res.send(JSON.stringify(result2));
				res.end();
				client.end();
			} catch (e) {

			}
			
			//client.destroy(); // kill client after server's response
		});
		client.on('drain', function (result) {
			//console.log('Received: ' + result);
			try {
				var result2 = JSON.parse(finalResult);
				if (result2.authToken) {

					res.cookie('authToken', result2.authToken, { maxAge: config.SessionExpiry });


					result2.authToken = null;
					delete result2.authToken;
				}

				res.send(JSON.stringify(result2));
				res.end();

			} catch (e) {
				res.send("Error in api manager: " + e);
				res.end();
			}
		});
		client.on('error', function (e) {
			console.log('Connection closed');
			console.log('problem with request: ' + e.message);
			var error = {};
			error.error = e;
			res.send(error);
		});

		client.on('close', function () {
			console.log('Client Connection closed');
		});

	},
	getOptions: function (path, method) {
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