//@ sourceURL=express.js
//var express = require('express');
//var app = express();
//var router = express.Router();
//var bodyParser = require('body-parser');
//app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//app.use(bodyParser.json({ limit: '50mb' }));
//var server = require('http').Server(app);
//var resolver = require("./resolver.js");
var extend = require('extend');

var stringDecoder = require('string_decoder').StringDecoder;
var decoder = new stringDecoder('utf8');
var resolver = require('./resolver.js');
//var schema = require('../../common/schema.js');
var net = require('net');
var HOST = '127.0.0.1';
var PORT = 6969;
var socketClass = {
	init: function (_processor) {
		socketClass.processor = _processor;
	},
	startListening: function () {
		var server = net.createServer(function (sock) {

			//console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
			var finalResult="";
			sock.on('data', function (data) {
				var finished = false;
				var parsedFinalResult;
				finalResult += decoder.write(data);
				try {
					parsedFinalResult = JSON.parse(finalResult);
					finalResul = "";
					finished = true;
				} catch (e) {
					finished = false;
				}
				if (finished) {
					try {
						socketClass.consume(sock, parsedFinalResult);
					} catch (err) {
						if (err && (err.message)) {
							sock.write(JSON.stringify({ error: err.message, stackTrace: err.stack, status: "ERROR" }));
						}
						else {
							sock.write(JSON.stringify({ error: err || 'Unknown Error', status: "ERROR" }));
						}
						sock.end();
					}

				}
			});
			sock.on('drain', function (d) {
			});
			sock.on('end', function (result) {
				
				//console.log('DATA ' + sock.remoteAddress + ': ' + data);
				//sock.write('You said "' + data + '"');

			});

			sock.on('close', function (data) {
				//console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
			});

		}).listen(PORT, HOST);
		//console.log('opened server on %j', server.address());
	},
	startapp: function () {
		socketClass.startListening();
	},
	consume: function (socket, data, schemaObj) {
		var resolved = resolver.resolve(socket, data, schemaObj);
		var processDef = socketClass.processor.process(resolved.payload, {}, resolved.platform);
		return processDef.done(function (result) {
			socket.write(JSON.stringify({ result: result.result, authToken: result.platformObject.getKey(), status: "OK" }));
			socket.end();
		}).fail(function (err) {
			try {
				console.error(JSON.stringify(err));
			} catch (e) {
				console.error(err);
			}
			if (err && (err.message)) {
				socket.write(JSON.stringify({ error: err.message, stackTrace: err.stack, status: "ERROR" }));
			}
			else {
				socket.write(JSON.stringify({ error: err || 'Unknown Error', status: "ERROR" }));
			}

			socket.end();
		});
	}
};

module.exports = socketClass;
