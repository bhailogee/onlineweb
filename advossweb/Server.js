
var express = require('express');
var app = express();
var compression = require('compression');
var server = require('http').Server(app);
//var io = require('socket.io')(server);
var routes = require('./server/routes/routes');

var bodyParser = require('body-parser');
var config = require('./config/config');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var nodemailer = require("nodemailer");
 /*
 Here we are configuring our SMTP Server details.
 STMP is mail server which is responsible for sending and recieving email.
 */
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "ayyazemail786@gmail.com",
        pass: "aj00bae71"
    }
});
/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/


app.get('/send',function(req,res){
    var mailOptions={
        to : req.query.to,
        subject : req.query.subject,
        text : req.query.text
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
        }else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
});

/*--------------------Routing Over----------------------------*/






// port to listen
var port = config.port;

//compress responses
app.use(compression());

//var sessionOptions = {
//    secret: 'shhh',
//    resave: true,
//    rolling: true,
//    saveUninitialized: true,
//    cookie: { maxAge: 60 * 60 * 1000 }

//}
var sessionOptions = {
    secret: '@dV0$$',
    resave : true
}
if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    console.log("secure cookie activated");
    sessionOptions.cookie.secure = true // serve secure cookies
}
app.use(cookieParser(sessionOptions.secret));
app.use(session(sessionOptions));

// Middleware set to to use bodyParser, uses url Encoder, then every data type will be included for parsing
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// converts to json object
app.use(bodyParser.json({ limit: '50mb' }));

app.use(express.static('app'));

// Registering Routes Configuration
// ===========================================
routes.registerRoutes(app);

//io.on('connection', function (socket) {
//    console.log('a user connected');
//    socket.on('disconnect', function () {
//        console.log('user disconnected');
//    });
//});

server.listen(port);

console.log("Server Started at "+ port);