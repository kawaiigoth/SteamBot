var express = require('express'),
    app = express(),
    config = require('./config/index'),
    session = require('express-session'),
    passport = require('passport'),
    SteamStrategy = require('passport-steam/').Strategy,
    path = require('path'),
    fs = require('fs'),
    loger = require('./libs/loger')(module),
    PAGES = require('./Routes/PAGES'),
    authRoutes = require('./Routes/auth'),
    BL = require('./BL'),
    bl = new BL(),
    server = undefined;




// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.

app.use(express.static('../frontend')); //TODO frontend ведет к html страницам, их либо убрать, либо выбирать более конкретныее папки нжеели весь форонтенд
app.set('views', path.join('../frontend'));
app.set('view engine', 'ejs');

passport.serializeUser(function (user, done) {
    loger.info("Serealize",user);
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    loger.info("Deserealize",id);
    bl.getUserByID(id,(result,error)=>{
        "use strict";
        if(error){
            loger.error(error);
            done(error);
        } else {
            done(null, result);
        }
    });

});

passport.use(new SteamStrategy({
        returnURL: 'http://localhost:8080/auth/login/return',
        realm: 'http://localhost:8080/',
        apiKey: '6FB88E3DCB0A9F8E3F075E3ACDC2B79E'
    },
    function (identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            loger.info("strat");
            profile.identifier = identifier;
            loger.info(profile);
            return done(null, profile);
        });
    }
));

app.use(session({
    secret: 'your secret',
    name: 'name of session id',
    resave: false,
    saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.set('port', process.env.PORT || config.get('port'));



app.use('/auth', authRoutes);  // Логин/Логаут и прочее
app.use('/', PAGES);




app.use(function (req, res) {
    res.status(404).send('not found');
});

app.use(function (err, req, res, next) {
    "use strict";
    if (process.env.NODE_ENV == 'development') {
        loger.error(err.stack);
        next(err);
    } else {
        loger.error(err.stack);
        res.sendStatus(500);
    }

});

function run() {
    server = app.listen(config.get('port'));
    loger.info("Running at Port " + config.get('port'));
}

function close() {
    server.close();
}

if (module.parent) {
    exports.run = run;
    exports.close = close;
} else {
    run();
}