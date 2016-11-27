//@ sourceURL=express.js
var express=require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
var server = require('http').Server(app);
var resolver = require("./resolver.js");
var extend = require('extend');
var schema = require('../../common/schema.js');

var expressroutes = {
	init: function (_processor) {
		expressroutes.processor = _processor;
		expressroutes.all();
		app.use('/', router);
	},
	startapp: function (port) {
		server.listen(port);
		console.log("Express Started...");
	},
	all: function () {

		var registeredRoutes = {};		
		var methods = schema.getRestMethods();
		for (method in methods) {
			if (methods.hasOwnProperty(method)) {
				if (["post", "get", "put", "patch", "delete"].indexOf(methods[method].HttpMethod.toLowerCase()) > -1) {
					//console.log(methods[method].HttpMethod.toLowerCase() + " : " + methods[method].CompletePath);
					router[methods[method].HttpMethod.toLowerCase()](methods[method].CompletePath, function (req, res, next) {
						//logging.requestLogging(req);
						//var schemaMethodObject = schema.getSchemaMethodByRoute(req.route.methods, req.route.path);
						//expressroutes.consume(req, res, next, schemaMethodObject);
						expressroutes.consume(req, res, next);
					});
					if (router.stack.length > 0) {
						if (registeredRoutes[router.stack[router.stack.length - 1].regexp] != null) {
							var error = "";
							console.error("Duplicate path found" + router.stack[router.stack.length - 1].regexp);
						}
						else {
							registeredRoutes[router.stack[router.stack.length - 1].regexp] = true
						}
					}
				}
			}
		}
		router.post('/', function (req, res, next) {
			expressroutes.consume(req, res, next);
		});
	},
	consume: function (req, res, next, schemaObj) {		
		var resolved = resolver.resolve(req, res, next, schemaObj);
		var processDef = expressroutes.processor.process(resolved.payload, {}, resolved.platform);
		return processDef.done(function (result) {
			res.write(JSON.stringify({ result: result.result, authToken: result.platformObject.getKey(), status: "OK" }));
			res.end();
		}).fail(function (err) {
			try {
				console.error(JSON.stringify(err));
			} catch (e) {
				console.error(err);
			}
			if (err && (err.message)) {
				res.write(JSON.stringify({ error: err.message, stackTrace: err.stack, status: "ERROR" }));
			}
			else {
				res.write(JSON.stringify({ error: err || 'Unknown Error', status: "ERROR" }));
			}
			
			res.end();
		}); 
	}
};

module.exports = expressroutes;
