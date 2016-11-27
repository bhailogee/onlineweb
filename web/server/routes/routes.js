// Routes Configurations
var apiRoutes = require('./codeBehindRoutes');
var authRoutes = require('./authRoutes');

var routes = {
    registerRoutes: function (app) {
        //app.use('/', authRoutes);
        app.use('/', apiRoutes);
    }
}



module.exports = routes;