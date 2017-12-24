const express = require('express'),
    loger = require('../libs/loger')(module),
    bodyParser = require('body-parser'),
    path = require('path'),
    BL = require('../BL'),
    router = express.Router(),
    bl = new BL();


router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.get('/', loadSellOffers, sendPage);
router.get('/index|/index.html', loadSellOffers, sendPage);
router.get('/settings|/settings.html', auth, sendPage);
router.get('/currency|/currency.html', auth, sendPage);
router.get('/trade|/trade.html', auth, tradePage, sendPage);
router.get('/create-offer|/create-offer.html', auth, sendPage);
router.get('/create-trade|/create-trade.html', auth, createTrade);


router.post('/create-offer', auth, createOffer);
router.post('/settings', auth, saveSettings);
router.post('/add-currency', auth, addCurrency);
router.post('/remove-currency', auth, removeCurrency);

function tradePage(req,res){
    "use strict";

}

function createTrade(req,res) {
    if(req.method === "GET"){
        let param = req.query.id;
        bl.getOffer(param,(result,error)=>{
            "use strict";
            if (error){
                loger.error(error);
                res.sendStatus(500);
            } else {
                loger.info(result);
                res.render("templates/create-trade", {user: req.user, trade: result});
            }
        })
    } else if (req.method === "POST") {
       bl.createTrade(req.body,req.user,(error,result)=>{
           "use strict";
           if(error){
               loger.error(error);
               res.sendStatus(500);
           } else {
               loger.info(result);
               res.sendStatus(200);
           }
       })
    } else {
        res.sendStatus(500);
    }
}

function createOffer(req, res) {
    bl.createOffer(req.body, req.user, function (result,error) {
        if (error) {
            loger.error(error);
            res.sendStatus(500);
        }
        else {
            loger.info("offer created!");
            res.sendStatus(200);
        }
    })

}

function addCurrency(req, res) {
    bl.takeKeys(req.body, req.user, function (result, err) {
        if (err) {
            res.sendStatus(500);
        }
        else {
            res.sendStatus(200);
        }
    })

}

function removeCurrency(req, res) {
    bl.giveKeys(req.body, req.user, function (result, err) {
        if (err) {
            res.sendStatus(500);
        }
        else {
            res.sendStatus(200);
        }
    })

}

function saveSettings(req, res) {
    bl.findAndUpdateUser(req.user, req.body, function (result, error) {
        if (error) {
            res.status(500).send(error);
        }
        else {
            res.sendStatus(200);
        }
    })

}

function loadSellOffers(req, res, next) {
    "use strict";
    bl.getOffers("sell", (offers, error) => {
        if (error) {
            loger.error(error);
            next();
        } else {
            req.data = offers;
            loger.info(offers);
            next();
        }
    })
}

function auth(req, res, next) {
    "use strict";
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/auth/login');
    }
}

function sendPage(req, res) {
    let fileName = req.originalUrl.replace(/\.[^/.]+$/, "");
    let pathToPage = fileName.length > 1 ? "templates/" + fileName : "templates/index";
    res.render(pathToPage, {user: req.user, data: req.data});

}


module.exports = router;