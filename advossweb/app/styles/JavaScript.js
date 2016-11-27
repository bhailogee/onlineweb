var http = require('http');
http.createServer(function (req, res) {
    con.log('hello world');
}).listen(9000, "127.0.0.1");
console.log('Server running at http://127.0.0.1:9000/');