var express = require('express')
    , router = express.Router(),
    loger = require('../libs/loger')(module)
    , passport = require('passport'),
    BL = require('../BL'),
    bl = new BL();


// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
router.get('/login',
    passport.authenticate('steam', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
router.get('/login/return',
    // Issue #37 - Workaround for Express router module stripping the full url, causing assertion to fail
    function (req, res, next) {

        req.url = req.originalUrl;
        next();
    },
    passport.authenticate('steam', {failureRedirect: '/'}),
    function (req, res) {
        res.redirect('/');
        bl.login(req.user, (result, error) => {
            "use strict";
            if(error){
                loger.error(error);
            }
        });
    });

module.exports = router;