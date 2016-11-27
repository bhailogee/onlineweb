var express = require('express');
var http = require('http');
var config = require('../../config/config');
var responseHandler = require("../../server/utility/responseHandler");
var apiRoutes = express.Router();
var schemaParser = require('../../server/schemaparser/schemaparser');
//var handleRequest = require("../../server/utility/handleRestCommunication");
var handleRequest = require("../../server/utility/handleSocketCommunication");

//apiRoutes.post('/login', function (req, res) {
//    debugger;
//    var options = {
//        hostname: config.hostname,
//        port: config.hostPort,
//        path: '/login',
//        method: 'POST',
//        headers: {
//            'Content-Type': 'application/json'
//        }
//    };
//    var req2 = http.request(options, function (res2) {
//        var res1 = res;
//        var result = "";
//        console.log('STATUS: ' + res2.statusCode);
//        console.log('HEADERS: ' + JSON.stringify(res2.headers));
//        res2.setEncoding('utf8');
//        res2.on('data', function (chunk) {
//            result += chunk;
//        });
//        res2.on('end', function () {
//            res1.send(result);
//        })
//    });

//    req2.on('error', function (e) {
//        console.log('problem with request: ' + e.message);
//    });

//    // write data to request body
//    req2.write(JSON.stringify(req.body));
//    req2.end();

//});

apiRoutes.all('/dataservice',isAuthenticated, function (req, res) {


        var options = {
            hostname: config.hostname,
            port: config.hostPort,
            path: config.defaultHostPath + "?apiName=" + req.param('apiName', null),
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
        req.body.header = utility.getPlatformHeader(req);
        //req.body.session = req.session;
        // write data to request body
        req2.write(JSON.stringify(req.body));
        req2.end();
    
});


function isAuthenticated(req, res, next) {	
	if (req.cookies["authToken"]) {
		next();
	}
	else {
		responseHandler.unauthorisedRequest(res);
	}
}

//apiRoutes.post("/upload", function (req, res) {
//    var fstream;
//    console.log("Uploading called");
//    req.pipe(req.busboy);
//    req.busboy.on('file', function (fieldname, file, filename) {
//        console.log("Uploading: " + filename);

//        //Path where image will be uploaded
//        fstream = fs.createWriteStream(__dirname + '/tempFiles/' + filename);
//        file.pipe(fstream);
//        fstream.on('close', function () {
//            console.log("Upload Finished of " + filename);
//            //res.redirect('back');           //where to go next
//        });
//    });
//    console.log("Uploading finished");
//});
var registeredRoutes = {};
var methods = schemaParser.getRestMethods();
for (method in methods) {
	
	if (methods.hasOwnProperty(method)) {
		if (methods[method].HttpMethod != null && methods[method].CompletePath != null) {
			if (["post", "get", "put", "all"].indexOf(methods[method].HttpMethod.toLowerCase()) > -1)
			{
				//console.log(methods[method].HttpMethod.toLowerCase() + ":" + methods[method].CompletePath);
				apiRoutes[methods[method].HttpMethod.toLowerCase()](methods[method].CompletePath, !!methods[method].NoAuthenticationRequired ? function (req, res, next) { next(); } : isAuthenticated, function (req, res, next) {
					handleRequest.sendRequest(req, res, next);
				});
				if (apiRoutes.stack.length > 0) {
					if (registeredRoutes[apiRoutes.stack[apiRoutes.stack.length - 1].regexp] != null) {
						var error = "";
						console.error("Duplicate path found" + apiRoutes.stack[apiRoutes.stack.length - 1].regexp);
					}
					else {
						registeredRoutes[apiRoutes.stack[apiRoutes.stack.length - 1].regexp] = true
					}
				}
			}
		}
	}
}

apiRoutes.all("/accounting", isAuthenticated, function (req, res) {
	var q = "";

});
module.exports = apiRoutes;